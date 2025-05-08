import fastify, { FastifyRequest, FastifyReply } from "fastify";
import { OpenAIClient } from "@ai-orchestrator/openai-client";

interface WebSearchRequest {
  query: string;
}

interface WebSearchResponse {
  results: string;
  function: string;
  error?: string;
}

const app = fastify();

const OPENAI_API_KEY = "";

const openaiClient = new OpenAIClient({
  apiKey: OPENAI_API_KEY || "",
});

const systemPrompt = `You are a helpful AI assistant specialized in web search. 
When given a search query, provide relevant and accurate information.
Format your response in a clear and organized manner.`;

async function processSearch(query: string): Promise<string> {
  console.log("Task here");
  const response = await openaiClient.processText(systemPrompt, query);
  if (typeof response === "string") {
    return response;
  }
  let fullResponse = "";
  for await (const chunk of response) {
    fullResponse += chunk;
  }
  return fullResponse;
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
      return { function: "web_search", results };
    } catch (error) {
      console.error("Error processing search:", error);
      return reply.status(500).send({
        results: "",
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
