import { OpenAI } from "openai";

export interface OpenAIConfig {
  apiKey: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export class OpenAIClient {
  private client: OpenAI;
  private config: OpenAIConfig;

  constructor(config: OpenAIConfig) {
    this.config = {
      model: "gpt-4o-mini",
      temperature: 0.7,
      maxTokens: 1000,
      ...config,
    };
    this.client = new OpenAI({
      apiKey: this.config.apiKey,
    });
  }

  async createChatCompletion(
    messages: { role: "system" | "user" | "assistant"; content: string }[]
  ): Promise<string> {
    const completion = await this.client.chat.completions.create({
      model: this.config.model!,
      messages,
      temperature: this.config.temperature,
      max_tokens: this.config.maxTokens,
    });

    console.log("Completion:", completion);

    return completion.choices[0].message.content || "";
  }

  async processText(systemPrompt: string, userInput: string): Promise<string> {
    return this.createChatCompletion([
      { role: "system", content: systemPrompt },
      { role: "user", content: userInput },
    ]);
  }
}
