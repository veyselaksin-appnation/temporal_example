import fastify from "fastify";

interface Text2TextRequest {
  input: string;
}

interface Text2TextResponse {
  output: string;
  error?: string;
}

const app = fastify();

// Mock text processing function
async function processText(input: string): Promise<string> {
  // This is a simple mock implementation
  if (input.toLowerCase().includes("joke")) {
    return "Why did the AI go to school? To get more artificial intelligence!";
  }
  return `Processed: ${input}`;
}

app.post<{ Body: Text2TextRequest; Reply: Text2TextResponse }>(
  "/process",
  async (request, reply) => {
    try {
      const { input } = request.body;
      const output = await processText(input);
      return { output };
    } catch (error) {
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
