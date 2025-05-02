import fastify from "fastify";
import { Client } from "@temporalio/client";
import { Connection } from "@temporalio/client";

interface PromptRequest {
  prompt: string;
}

interface PromptResponse {
  result: any;
  error?: string;
}

const app = fastify();

// Mock AI function caller
async function mockAIFunctionCaller(prompt: string) {
  // This is a simple mock implementation
  if (prompt.toLowerCase().includes("joke")) {
    return {
      function: "text2text",
      arguments: {
        input: prompt,
      },
    };
  } else if (prompt.toLowerCase().includes("search")) {
    return {
      function: "web_search",
      arguments: {
        query: prompt,
      },
    };
  }
  throw new Error("No matching function found");
}

// Initialize Temporal client
const start = async () => {
  try {
    const connection = await Connection.connect({
      address: process.env.TEMPORAL_ADDRESS || "temporal:7233",
    });

    const temporalClient = new Client({
      connection,
    });

    app.post<{ Body: PromptRequest; Reply: PromptResponse }>(
      "/prompt",
      async (request, reply) => {
        try {
          const { prompt } = request.body;

          // Get function call from mock AI
          const functionCall = await mockAIFunctionCaller(prompt);

          // Start workflow
          const handle = await temporalClient.workflow.start(
            "orchestrateFunction",
            {
              taskQueue: "ai-orchestrator",
              args: [functionCall],
              workflowId: `orchestrate-${Date.now()}`,
            }
          );

          // Get result
          const result = await handle.result();

          return { result };
        } catch (error) {
          console.error("Workflow error:", error);
          return reply.status(500).send({
            result: null,
            error:
              error instanceof Error ? error.message : "Unknown error occurred",
          });
        }
      }
    );

    await app.listen({ port: 3000, host: "0.0.0.0" });
    console.log("API Gateway running on port 3000");
  } catch (err) {
    console.error("Startup error:", err);
    process.exit(1);
  }
};

start();
