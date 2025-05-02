import fastify from "fastify";

interface WebSearchRequest {
  query: string;
}

interface WebSearchResponse {
  results: Array<{
    title: string;
    url: string;
    snippet: string;
  }>;
  error?: string;
}

const app = fastify();

// Mock search function
async function searchWeb(query: string): Promise<WebSearchResponse> {
  // This is a simple mock implementation
  return {
    results: [
      {
        title: `Search result for: ${query}`,
        url: "https://example.com/result1",
        snippet: "This is a mock search result snippet.",
      },
      {
        title: "Another search result",
        url: "https://example.com/result2",
        snippet: "Another mock search result snippet.",
      },
    ],
  };
}

app.post<{ Body: WebSearchRequest; Reply: WebSearchResponse }>(
  "/search",
  async (request, reply) => {
    try {
      const { query } = request.body;
      return await searchWeb(query);
    } catch (error) {
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
    console.log("Web search service is running on port 3002");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
