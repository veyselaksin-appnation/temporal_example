import fastify, { FastifyRequest, FastifyReply } from "fastify";
import { OpenAIClient } from "@ai-orchestrator/openai-client";

interface Text2TextRequest {
  input: string;
}

interface Text2TextResponse {
  output: string;
  error?: string;
}

const app = fastify();

const openaiClient = new OpenAIClient({
  apiKey: process.env.OPENAI_API_KEY || "",
});

const systemPrompt = `You are a helpful AI assistant. Your responses should be clear, concise, and accurate. 
When providing information, always ensure it is factually correct and up-to-date. 
If you're unsure about something, acknowledge the uncertainty rather than providing potentially incorrect information.
Format your response in a way that is easy to read and understand.`;

async function processText(input: string): Promise<string> {
  return openaiClient.processText(systemPrompt, input);
}

app.post<{ Body: Text2TextRequest; Reply: Text2TextResponse }>(
  "/process",
  async (
    request: FastifyRequest<{ Body: Text2TextRequest }>,
    reply: FastifyReply
  ) => {
    try {
      const { input } = request.body;
      const output = await processText(input);
      return { output };
    } catch (error) {
      console.error("Error processing text:", error);
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
