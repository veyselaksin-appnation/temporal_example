import { Context } from "@temporalio/activity";
import { WorkflowClient, Connection } from "@temporalio/client";
import { SERVICES, TEMPORAL } from "@ai-orchestrator/shared";

export async function callMicroservice(prompt: string): Promise<any> {
  const workflowId = Context.current().info.workflowExecution.workflowId;
  const connection = await Connection.connect({
    address: TEMPORAL.ADDRESS,
  });
  const client = new WorkflowClient({ connection });

  try {
    const handle = client.getHandle(workflowId);

    // Call text2text service with stream option
    const response = await fetch(SERVICES.text2text.endpoint, {
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

    return { success: true, service: SERVICES.text2text.name };
  } catch (error) {
    console.error("Error in callMicroservice:", error);
    throw error;
  }
}
