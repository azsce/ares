import OpenAI from "openai";
import type { DocEnvConfig } from "./config";
import { logDebug, logInfo } from "./logger";

export interface GenerateChapterResult {
  content: string;
  model: string;
  finishReason: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  } | null;
}

function createClient(config: DocEnvConfig): OpenAI {
  return new OpenAI({
    baseURL: config.CUSTOM_API_ENDPOINT,
    apiKey: config.CUSTOM_API_KEY,
    timeout: 10 * 60 * 1000,
    maxRetries: 3,
  });
}

export async function generateChapter(
  config: DocEnvConfig,
  systemPrompt: string,
  userPrompt: string,
  context: string
): Promise<GenerateChapterResult> {
  const client = createClient(config);

  const fullUserMessage = `${userPrompt}\n\n---\n\n# Repository Context\n\n${context}`;

  logDebug(`System prompt length: ${String(systemPrompt.length)} chars`);
  logDebug(`User prompt + context length: ${String(fullUserMessage.length)} chars`);

  const maxTokens = config.MAX_OUTPUT_TOKENS;

  const completion = await client.chat.completions.create({
    model: config.AI_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: fullUserMessage },
    ],
    temperature: 0.3,
    max_tokens: maxTokens,
  });

  const choice = completion.choices[0];
  if (!choice) {
    throw new Error("AI returned no choices");
  }

  const messageContent = choice.message.content;
  if (!messageContent) {
    throw new Error("AI returned empty response");
  }

  logInfo(`Model: ${completion.model}`);
  if (completion.usage) {
    logInfo(
      `Tokens - Prompt: ${String(completion.usage.prompt_tokens)}, ` +
        `Completion: ${String(completion.usage.completion_tokens)}, ` +
        `Total: ${String(completion.usage.total_tokens)}`
    );
  }

  return {
    content: messageContent,
    model: completion.model,
    finishReason: choice.finish_reason,
    usage: completion.usage
      ? {
          promptTokens: completion.usage.prompt_tokens,
          completionTokens: completion.usage.completion_tokens,
          totalTokens: completion.usage.total_tokens,
        }
      : null,
  };
}
