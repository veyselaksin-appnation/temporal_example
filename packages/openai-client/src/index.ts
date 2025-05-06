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
    messages: { role: "system" | "user" | "assistant"; content: string }[],
    stream: boolean = false
  ): Promise<string | AsyncIterable<string>> {
    const completion = await this.client.chat.completions.create({
      model: this.config.model!,
      messages,
      temperature: this.config.temperature,
      max_tokens: this.config.maxTokens,
      stream,
    });

    if (stream) {
      return this.streamResponse(completion as AsyncIterable<any>);
    }

    const nonStreamCompletion = completion as any;
    console.log("Completion:", nonStreamCompletion);
    return nonStreamCompletion.choices[0].message.content || "";
  }

  private async *streamResponse(
    completion: AsyncIterable<any>
  ): AsyncIterable<string> {
    for await (const chunk of completion) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) {
        yield content;
      }
    }
  }

  async processText(
    systemPrompt: string,
    userInput: string,
    stream: boolean = false
  ): Promise<string | AsyncIterable<string>> {
    return this.createChatCompletion(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userInput },
      ],
      stream
    );
  }
}
