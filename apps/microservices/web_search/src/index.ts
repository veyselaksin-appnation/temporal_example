import fastify, { FastifyRequest, FastifyReply } from "fastify";
import { OpenAIClient } from "@ai-orchestrator/openai-client";

interface WebSearchRequest {
  query: string;
}

interface WebSearchResponse {
  results: string[];
  error?: string;
}

const app = fastify();

const openaiClient = new OpenAIClient({
  apiKey: process.env.OPENAI_API_KEY || "",
});

const systemPrompt = `You are a helpful AI assistant specialized in web search. 
When given a search query, provide relevant and accurate information.
Format your response in a clear and organized manner.`;

async function processSearch(query: string): Promise<string[]> {
  const response = await openaiClient.processText(systemPrompt, query);
  console.log("Response:", response);
  return [response]; // For now, return a single result
}

app.post<{ Body: WebSearchRequest; Reply: WebSearchResponse }>(
  "/search",
  async (
    request: FastifyRequest<{ Body: WebSearchRequest }>,
    reply: FastifyReply
  ) => {
    try {
      const { query } = request.body;
      console.log("Query:", query);
      const results = await processSearch(query);
      return { results };
    } catch (error) {
      console.error("Error processing search:", error);
      return reply.status(500).send({
        results: [],
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  }
);

const start = async () => {
  try {
    await app.listen({ port: 3002, host: "0.0.0.0" });
    console.log("Web Search service running on port 3002");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
