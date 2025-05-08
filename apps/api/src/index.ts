import fastify from "fastify";
import { Client, Connection } from "@temporalio/client";
import { API, TEMPORAL } from "@ai-orchestrator/shared";

const app = fastify();

const start = async () => {
  const connection = await Connection.connect({
    address: TEMPORAL.ADDRESS,
  });
  const client = new Client({
    connection,
  });

  app.post(API.ENDPOINTS.PROMPT, async (request, reply) => {
    try {
      const { prompt } = request.body as { prompt: string };

      if (!prompt) {
        return reply.status(400).send({
          error: "Prompt is required",
        });
      }

      const workflowId = `prompt-${Date.now()}`;

      // Set headers for streaming
      reply.raw.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      });

      // Start the workflow
      const handle = await client.workflow.start("orchestrateFunction", {
        taskQueue: TEMPORAL.TASK_QUEUES.DEFAULT,
        args: [prompt],
        workflowId,
      });

      // Create a promise to wait for the stream signal
      const checkSignal = async () => {
        try {
          const execution = await client.workflow.getHandle(workflowId);
          const history = await execution.fetchHistory();

          // Find all stream signals
          const streamEvents =
            history.events?.filter(
              (event) =>
                event.workflowExecutionSignaledEventAttributes?.signalName ===
                "streamSignal"
            ) || [];

          // Process each stream signal
          for (const event of streamEvents) {
            if (event.workflowExecutionSignaledEventAttributes?.input) {
              const input =
                event.workflowExecutionSignaledEventAttributes.input;
              if (input.payloads && input.payloads[0]?.data) {
                const data = input.payloads[0].data;
                try {
                  const parsedData = JSON.parse(data.toString());
                  // Send the chunk to the client
                  reply.raw.write(`data: ${JSON.stringify(parsedData)}\n\n`);
                } catch (parseError) {
                  console.error("Error parsing stream data:", parseError);
                }
              }
            }
          }

          // Check if workflow is completed
          const isCompleted = history.events?.some(
            (event) => event.workflowExecutionCompletedEventAttributes
          );

          if (isCompleted) {
            reply.raw.write("data: [DONE]\n\n");
            reply.raw.end();
            return;
          }

          // Check again after 1 second
          setTimeout(checkSignal, 1000);
        } catch (error) {
          console.error("Error checking signal:", error);
          reply.raw.write(
            `error: ${
              error instanceof Error ? error.message : "Unknown error"
            }\n\n`
          );
          reply.raw.end();
        }
      };

      // Start checking for signals
      checkSignal();
    } catch (error) {
      console.error("Error:", error);
      reply.raw.write(
        `error: ${error instanceof Error ? error.message : "Unknown error"}\n\n`
      );
      reply.raw.end();
    }
  });

  try {
    await app.listen({ port: API.PORTS.GATEWAY, host: "0.0.0.0" });
    console.log(`API Gateway running on port ${API.PORTS.GATEWAY}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
