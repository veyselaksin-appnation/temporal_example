import fastify, { FastifyRequest, FastifyReply } from "fastify";
import { OpenAIClient } from "@ai-orchestrator/openai-client";

interface Text2TextRequest {
  input: string;
  stream?: boolean;
}

interface Text2TextResponse {
  output: string;
  error?: string;
}

const app = fastify();

const OPENAI_API_KEY = "";

const openaiClient = new OpenAIClient({
  apiKey: OPENAI_API_KEY || "",
});

const systemPrompt = `You are a helpful AI assistant. Your responses should be clear, concise, and accurate. 
When providing information, always ensure it is factually correct and up-to-date. 
If you're unsure about something, acknowledge the uncertainty rather than providing potentially incorrect information.
Format your response in a way that is easy to read and understand.`;

async function processText(
  input: string,
  stream: boolean = false
): Promise<string | AsyncIterable<string>> {
  const messages = [
    { role: "system" as const, content: systemPrompt },
    { role: "user" as const, content: input },
  ];
  return openaiClient.createChatCompletion(messages, stream);
}

app.post<{ Body: Text2TextRequest; Reply: Text2TextResponse }>(
  "/process",
  async (
    request: FastifyRequest<{ Body: Text2TextRequest }>,
    reply: FastifyReply
  ) => {
    try {
      const { input, stream = false } = request.body;

      if (stream) {
        reply.raw.setHeader("Content-Type", "text/event-stream");
        reply.raw.setHeader("Cache-Control", "no-cache");
        reply.raw.setHeader("Connection", "keep-alive");
        reply.raw.setHeader("X-Accel-Buffering", "no");

        const streamResponse = (await processText(
          input,
          true
        )) as AsyncIterable<string>;

        for await (const chunk of streamResponse) {
          const data = JSON.stringify({ output: chunk });
          console.log("Data: ", data);
          reply.raw.write(`data: ${data}\n\n`);
        }

        reply.raw.end();
        return reply;
      } else {
        const output = (await processText(input)) as string;
        return { output };
      }
    } catch (error) {
      console.error("Error processing text:", error);
      if (request.body.stream) {
        reply.raw.write(
          `data: ${JSON.stringify({
            error:
              error instanceof Error ? error.message : "Unknown error occurred",
          })}\n\n`
        );
        reply.raw.end();
        return reply;
      }
      return reply.status(500).send({
        output: "",
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  }
);

const start = async () => {
  try {
    await app.listen({ port: 3001, host: "0.0.0.0" });
    console.log("Text2Text service running on port 3001");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
