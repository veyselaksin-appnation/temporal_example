/*
OpenAI-like SDK for calling the AI orchestrator service.

Example usage:
const callit = new Callit("your-api-key");
const result = await callit.createCompletion({
  prompt: "What is the capital of the moon?"
});

Response schema:
{
  function: string;    // The function that was called (e.g. "text2text", "web_search", "text2img")
  arguments: {         // The arguments passed to the function
    input: string;     // The input prompt
    response: string;  // The AI's response
  };
  usage: {            // Usage statistics
    tokens: number;   // Number of tokens used
    cost: number;     // Cost in USD
    currency: string; // Currency code
  };
}
*/

import { OpenAI } from "openai";

type FunctionType = "text2text" | "web_search" | "text2img";

interface CallitResponse {
  function: FunctionType;
  arguments: {
    input: string;
    response: string;
  };
  usage: {
    tokens: number;
    cost: number;
  };
}

interface CreateCompletionParams {
  prompt: string;
  temperature?: number;
  max_tokens?: number;
}

class Callit {
  private readonly openai: OpenAI;
  private readonly model = "gpt-4o-mini";
  private readonly defaultTemperature = 0.7;
  private readonly defaultMaxTokens = 1000;
  private readonly systemPrompt = `You are a function router that determines the appropriate function to call based on user input.
Your task is to analyze the user's prompt and determine which function should be called:

1. text2text: For general questions, explanations, or text-based tasks
2. web_search: For queries that require up-to-date information or external data
3. text2img: For requests to generate or describe images

Respond with ONLY the function name (text2text, web_search, or text2img) and nothing else.`;

  constructor(private readonly apiKey: string) {
    this.openai = new OpenAI({
      apiKey: this.apiKey,
    });
  }

  private async determineFunctionType(prompt: string): Promise<FunctionType> {
    const completion = await this.openai.chat.completions.create({
      model: this.model,
      messages: [
        { role: "system", content: this.systemPrompt },
        { role: "user", content: prompt },
      ],
      temperature: 0,
      max_tokens: 10,
    });

    const functionType =
      completion.choices[0].message.content?.trim() as FunctionType;
    if (!["text2text", "web_search", "text2img"].includes(functionType)) {
      return "text2text"; // Default to text2text if invalid function type
    }
    return functionType;
  }

  async createCompletion(
    params: CreateCompletionParams
  ): Promise<CallitResponse> {
    const {
      prompt,
      temperature = this.defaultTemperature,
      max_tokens,
    } = params;

    // Determine which function to call
    const functionType = await this.determineFunctionType(prompt);

    // Create completion
    const completion = await this.openai.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: "system",
          content: this.systemPrompt,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature,
      max_tokens,
    });

    const response = completion.choices[0].message.content || "";

    // Calculate usage
    const usage = {
      tokens: completion.usage?.total_tokens || 0,
      cost: this.calculateCost(completion.usage?.total_tokens || 0),
    };

    return {
      function: functionType,
      arguments: {
        input: prompt,
        response,
      },
      usage,
    };
  }

  private calculateCost(tokens: number): number {
    const costPerToken = 0.03 / 1000; // GPT-4 cost per token
    return Number((tokens * costPerToken).toFixed(6));
  }
}

export {
  Callit,
  type CallitResponse,
  type CreateCompletionParams,
  type FunctionType,
};
