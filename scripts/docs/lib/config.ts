import { z } from "zod";

const envSchema = z.object({
  CUSTOM_API_ENDPOINT: z.url({ message: "CUSTOM_API_ENDPOINT must be a valid URL" }),
  CUSTOM_API_KEY: z.string().min(1, { message: "CUSTOM_API_KEY is required" }),
  AI_MODEL: z.string().min(1, { message: "AI_MODEL is required" }),
  MAX_INPUT_TOKENS: z.coerce.number().int().positive({ message: "MAX_INPUT_TOKENS must be a positive integer" }),
  MAX_OUTPUT_TOKENS: z.coerce
    .number()
    .int()
    .positive({ message: "MAX_OUTPUT_TOKENS must be a positive integer" })
    .optional()
    .default(16384),
  CONCURRENCY: z.coerce
    .number()
    .int()
    .min(1, { message: "CONCURRENCY must be at least 1" })
    .max(10, { message: "CONCURRENCY must be at most 10" })
    .optional()
    .default(3),
  OUTPUT_DIR: z.string().min(1, { message: "OUTPUT_DIR is required" }),
  COMPRESS_CONTEXT: z
    .string()
    .optional()
    .transform(val => val !== "false"),
  REMOVE_EMPTY_LINES: z
    .string()
    .optional()
    .transform(val => val !== "false"),
  REMOVE_COMMENTS: z
    .string()
    .optional()
    .transform(val => val === "true"),
  INCLUDE_GIT_LOGS: z
    .string()
    .optional()
    .transform(val => val === "true"),
  INCLUDE_GIT_DIFFS: z
    .string()
    .optional()
    .transform(val => val === "true"),
});

export type DocEnvConfig = z.infer<typeof envSchema>;

export function loadConfig(): DocEnvConfig {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.issues.map(issue => `  - ${issue.path.join(".")}: ${issue.message}`);
    throw new Error(`Invalid configuration:\n${errors.join("\n")}\n\nCheck your .env file against .env.example`);
  }

  return result.data;
}

export function validateConfig(config: DocEnvConfig): void {
  const responseReserve = 8000;
  const minTokens = responseReserve + 1000;
  if (config.MAX_INPUT_TOKENS < minTokens) {
    throw new Error(
      `MAX_INPUT_TOKENS (${String(config.MAX_INPUT_TOKENS)}) is too low. ` +
        `Minimum: ${String(minTokens)} (need room for prompt + response)`
    );
  }
}
