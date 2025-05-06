import { Context } from "@temporalio/activity";
import { WorkflowClient, Connection } from "@temporalio/client";
import OpenAI from "openai";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

export async function callMicroservice(prompt: string): Promise<any> {
  const workflowId = Context.current().info.workflowExecution.workflowId;
  const connection = await Connection.connect({
    address: process.env.TEMPORAL_ADDRESS || "temporal:7233",
  });
  const client = new WorkflowClient({ connection });

  try {
    const handle = client.getHandle(workflowId);

    // Make OpenAI API call with streaming
    const stream = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      stream: true,
    });

    // Process the stream and send each chunk as a signal
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        await handle.signal("streamSignal", {
          content,
          timestamp: new Date().toISOString(),
        });
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error in callMicroservice:", error);
    throw error;
  }
}
