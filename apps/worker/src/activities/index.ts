import { Context } from "@temporalio/activity";
import { WorkflowClient, Connection } from "@temporalio/client";

const availableServices = {
  text2text: {
    name: "text2text_service",
    description: "Generates text responses based on the input prompt",
    endpoint: "http://text2text:3001/process",
  },
  web_search: {
    name: "web_search_service",
    description: "Searches the web and provides information based on the query",
    endpoint: "http://web_search:3002/search",
  },
};

export async function callMicroservice(prompt: string): Promise<any> {
  const workflowId = Context.current().info.workflowExecution.workflowId;
  const connection = await Connection.connect({
    address: process.env.TEMPORAL_ADDRESS || "temporal:7233",
  });
  const client = new WorkflowClient({ connection });

  try {
    const handle = client.getHandle(workflowId);

    // Call text2text service with stream option
    const response = await fetch(availableServices.text2text.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      body: JSON.stringify({
        input: prompt,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Text2Text service error: ${errorData.message || response.statusText}`
      );
    }

    // Get the stream from response
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("No stream available");
    }

    // Process the stream
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      // Decode the chunk and split by newlines to handle multiple chunks
      const text = new TextDecoder().decode(value);
      const chunks = text.split("\n").filter((chunk) => chunk.trim());

      // Send each chunk as a separate signal
      for (const chunk of chunks) {
        if (chunk.trim()) {
          await handle.signal("streamSignal", {
            content: chunk.trim(),
            timestamp: new Date().toISOString(),
            type: "content",
          });
        }
      }
    }

    return { success: true, service: availableServices.text2text.name };
  } catch (error) {
    console.error("Error in callMicroservice:", error);
    throw error;
  }
}
