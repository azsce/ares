export const TOKENS_PER_CHAR_ESTIMATE = 0.25;
export const PROMPT_OVERHEAD_TOKENS = 4000;
export const RESPONSE_RESERVE_TOKENS = 4000;
export const SAFETY_BUFFER_TOKENS = 2000;

export interface TokenBudget {
  maxInputTokens: number;
  promptOverhead: number;
  responseReserve: number;
  usableContextTokens: number;
}

export function calculateTokenBudget(maxInputTokens: number): TokenBudget {
  const promptOverhead = PROMPT_OVERHEAD_TOKENS;
  const responseReserve = RESPONSE_RESERVE_TOKENS;
  const usableContextTokens = maxInputTokens - promptOverhead - responseReserve - SAFETY_BUFFER_TOKENS;

  return {
    maxInputTokens,
    promptOverhead,
    responseReserve,
    usableContextTokens: Math.max(usableContextTokens, 1000),
  };
}

export function estimateTokensFromChars(charCount: number): number {
  return Math.ceil(charCount * TOKENS_PER_CHAR_ESTIMATE);
}

export function needsContextSplit(totalTokens: number, budget: TokenBudget): boolean {
  return totalTokens > budget.usableContextTokens;
}

export function calculateSplitChunks(totalTokens: number, budget: TokenBudget): number {
  if (totalTokens <= budget.usableContextTokens) return 1;
  return Math.ceil(totalTokens / budget.usableContextTokens);
}

export function formatTokenCount(tokens: number): string {
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(1)}M`;
  if (tokens >= 1_000) return `${(tokens / 1_000).toFixed(1)}K`;
  return String(tokens);
}
