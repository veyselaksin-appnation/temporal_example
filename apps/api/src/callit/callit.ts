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
  };
  usage?: {
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
  private readonly model = "gpt-4-turbo-preview";
  private readonly defaultTemperature = 0.7;
  private readonly defaultMaxTokens = 1000;

  constructor(private readonly apiKey: string) {
    this.openai = new OpenAI({
      apiKey: this.apiKey,
    });
  }

  private async determineFunctionType(prompt: string): Promise<FunctionType> {
    const completion = await this.openai.chat.completions.create({
      model: this.model,
      messages: [{ role: "user", content: prompt }],
      functions: [
        {
          name: "route_function",
          description: "Route the user input to the appropriate function",
          parameters: {
            type: "object",
            properties: {
              functionType: {
                type: "string",
                enum: ["text2text", "web_search", "text2img"],
                description: "The type of function to route to",
              },
              reasoning: {
                type: "string",
                description:
                  "Brief explanation of why this function was chosen",
              },
            },
            required: ["functionType"],
          },
        },
      ],
      function_call: { name: "route_function" },
    });

    console.log("Function call response:", completion);
    const functionCall = completion.choices[0].message.function_call;
    console.log(
      "Function call:",
      JSON.stringify(completion.choices[0].message, null, 2)
    );
    if (!functionCall) {
      return "text2text"; // Default fallback
    }

    const result = JSON.parse(functionCall.arguments);
    return result.functionType as FunctionType;
  }

  async createCompletion(
    params: CreateCompletionParams
  ): Promise<CallitResponse> {
    const {
      prompt,
      temperature = this.defaultTemperature,
      max_tokens,
    } = params;

    const functionType = await this.determineFunctionType(prompt);

    return {
      function: functionType,
      arguments: {
        input: prompt,
      },
    };
  }
}

export {
  Callit,
  type CallitResponse,
  type CreateCompletionParams,
  type FunctionType,
};
