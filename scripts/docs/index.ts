import { loadConfig, validateConfig, type DocEnvConfig } from "./lib/config";
import { packRepository, type PackResult } from "./lib/repomix";
import { generateChapter, type GenerateChapterResult } from "./lib/ai-client";
import { writeChapterFile, logWriteResult, validateChapterOutput } from "./lib/output";
import { calculateTokenBudget, formatTokenCount } from "./lib/token-utils";
import { CHAPTERS, getChapterById, getChaptersByIds, type ChapterConfig } from "./chapters";
import {
  printBanner,
  logStep,
  logInfo,
  logSuccess,
  logError,
  logWarn,
  logDebug,
  logSubstep,
  setDebugMode,
  startSpinner,
  stopSpinner,
} from "./lib/logger";

export interface GenerateOptions {
  all: boolean;
  chapters: string[];
  dryRun: boolean;
  debug: boolean;
  forceCompress: boolean;
  help: boolean;
}

function parseArgs(): GenerateOptions {
  const args = process.argv.slice(2);

  return {
    all: args.includes("--all"),
    chapters: parseChapterArgs(args),
    dryRun: args.includes("--dry-run"),
    debug: args.includes("--debug"),
    forceCompress: args.includes("--compress"),
    help: args.includes("--help") || args.includes("-h"),
  };
}

function parseChapterArgs(args: string[]): string[] {
  const chapters: string[] = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--chapter" && args[i + 1]) {
      const chapterId = args[i + 1];
      if (chapterId) {
        chapters.push(chapterId);
      }
    }
  }
  return chapters;
}

function printHelp(): void {
  printBanner();
  console.log(`
Ares Documentation Generator

Usage:
  bun run generate.ts [options]

Options:
  --all              Generate all chapters
  --chapter <id>     Generate specific chapter (1-5, appendix-a, appendix-b)
                     Can be used multiple times: --chapter 3 --chapter 4
  --compress         Force code compression in repomix output
  --dry-run          Pack repository and count tokens without calling AI
  --debug            Enable debug logging
  --help, -h         Show this help message

Chapter IDs:
  1          Chapter 1: Introduction
  2          Chapter 2: Background Materials
  3          Chapter 3: System Design
  4          Chapter 4: Results and Discussion
  5          Chapter 5: Conclusion and Future Work
  appendix-a Appendix A: File Structure & Execution
  appendix-b Appendix B: References

Examples:
  bun run generate.ts --all                      # Generate everything
  bun run generate.ts --chapter 3                # Generate chapter 3 only
  bun run generate.ts --chapter 3 --chapter 4     # Generate chapters 3 and 4
  bun run generate.ts --dry-run                   # Check token counts only
  bun run generate.ts --compress --debug         # Compress with debug info

Configuration:
  Copy .env.example to .env and fill in your API credentials.
  Set MAX_INPUT_TOKENS to match your AI model's context window.
`);
}

function selectChapters(options: GenerateOptions): ChapterConfig[] {
  if (options.all) return CHAPTERS;
  if (options.chapters.length > 0) {
    const selected = getChaptersByIds(options.chapters);
    const notFound = options.chapters.filter((id) => !getChapterById(id));
    for (const id of notFound) {
      logWarn(`Chapter '${id}' not found, skipping`);
    }
    return selected;
  }
  return CHAPTERS;
}

async function packForChapter(
  config: DocEnvConfig,
  chapter: ChapterConfig,
  forceCompress: boolean
): Promise<PackResult> {
  logInfo(`Packing context for: ${chapter.title}`);
  logInfo(`Include patterns: ${chapter.includePatterns.join(", ")}`);

  const packResult = await packRepository(config, forceCompress, chapter.includePatterns);

  logInfo(`Files packed: ${String(packResult.totalFiles)}`);
  logInfo(`Total tokens: ${formatTokenCount(packResult.totalTokens)}`);
  logInfo(`Compressed: ${packResult.wasCompressed ? "yes" : "no"}`);

  return packResult;
}

async function generateOneChapter(
  config: DocEnvConfig,
  chapter: ChapterConfig,
  packResult: PackResult
): Promise<{ success: boolean; error?: string }> {
  logStep(`Generating ${chapter.title}`);

  startSpinner(`Calling AI for ${chapter.heading}...`);

  try {
    const result: GenerateChapterResult = await generateChapter(
      config,
      chapter.systemPrompt,
      chapter.userPrompt,
      packResult.content
    );

    stopSpinner(true, `AI responded (${result.finishReason})`);

    const writeResult = await writeChapterFile(config.OUTPUT_DIR, chapter.filename, result.content);

    const headingPart = chapter.heading.split(":")[0] ?? "";
    const isValid = validateChapterOutput(result.content, headingPart);
    if (!isValid) {
      logWarn(`Output heading may not match expected: '${chapter.heading}'`);
    }

    logWriteResult(writeResult);
    return { success: true };
  } catch (error) {
    stopSpinner(false, "Generation failed");
    const message = error instanceof Error ? error.message : "Unknown error";
    logError(`Failed to generate ${chapter.title}: ${message}`);
    if (error instanceof Error && error.stack) {
      logDebug(error.stack);
    }
    return { success: false, error: message };
  }
}

async function dryRunChapter(
  config: DocEnvConfig,
  chapter: ChapterConfig,
  forceCompress: boolean
): Promise<PackResult> {
  logStep(`Dry Run - ${chapter.title}`);
  return packForChapter(config, chapter, forceCompress);
}

interface ConcurrencyLimit {
  active: number;
  queue: Array<() => Promise<void>>;
}

async function runWithConcurrency<T>(
  tasks: Array<() => Promise<T>>,
  maxConcurrency: number
): Promise<T[]> {
  if (tasks.length === 0) return [];

  const results: T[] = new Array(tasks.length);
  let nextIndex = 0;
  let activeCount = 0;

  async function runNext(): Promise<void> {
    while (nextIndex < tasks.length) {
      const index = nextIndex++;
      const task = tasks[index]!;

      try {
        results[index] = await task();
      } finally {
        activeCount--;
        if (nextIndex < tasks.length) {
          runNext();
        }
      }
    }
  }

  const initialWorkers = Math.min(maxConcurrency, tasks.length);
  const workers = Array.from({ length: initialWorkers }, () => runNext());

  await Promise.all(workers);
  return results;
}

async function main(): Promise<void> {
  const options = parseArgs();

  if (options.help) {
    printHelp();
    process.exit(0);
  }

  if (options.debug) {
    setDebugMode(true);
  }

  printBanner();

  // Load and validate configuration
  logStep("Configuration");

  let config: DocEnvConfig;
  try {
    config = loadConfig();
    validateConfig(config);
    logSuccess("Configuration loaded and validated");
    logInfo(`API endpoint: ${config.CUSTOM_API_ENDPOINT}`);
    logInfo(`Model: ${config.AI_MODEL}`);
    logInfo(`Max input tokens: ${String(config.MAX_INPUT_TOKENS)}`);
    logInfo(`Max output tokens: ${String(config.MAX_OUTPUT_TOKENS)}`);
    logInfo(`Output directory: ${config.OUTPUT_DIR}`);
    logInfo(`Concurrency: ${String(config.CONCURRENCY)}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logError(`Configuration error: ${message}`);
    logInfo("Copy .env.example to .env and fill in your credentials.");
    process.exit(1);
  }

  // Select chapters
  const chapters = selectChapters(options);
  if (chapters.length === 0) {
    logError("No chapters selected. Use --all or --chapter <id>");
    process.exit(1);
  }

  logInfo(`Chapters to generate: ${String(chapters.length)}`);
  for (const ch of chapters) {
    logSubstep(`${ch.id}: ${ch.title}`);
  }

  // Dry run mode: pack and show token counts for each chapter's context
  if (options.dryRun) {
    const budget = calculateTokenBudget(config.MAX_INPUT_TOKENS);
    logStep("Dry Run - Packing Per-Chapter Context");

    for (const chapter of chapters) {
      const packResult = await dryRunChapter(config, chapter, options.forceCompress);
      const fits = packResult.totalTokens <= budget.usableContextTokens;
      const status = fits ? "FITS" : "EXCEEDS";
      logInfo(
        `  ${chapter.id}: ${formatTokenCount(packResult.totalTokens)} tokens - ${status} budget (${formatTokenCount(budget.usableContextTokens)})`
      );
      if (!fits) {
        logWarn(`  Chapter ${chapter.id} context exceeds budget. Consider more specific include patterns.`);
      }
    }

    process.exit(0);
  }

  // Generate chapters with concurrency
  logStep("Packing All Chapter Contexts");

  const packResults: (PackResult | null)[] = new Array(chapters.length);
  const packTasks = chapters.map(
    async (chapter, index) => {
      try {
        packResults[index] = await packForChapter(config, chapter, options.forceCompress);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        logError(`Failed to pack context for ${chapter.title}: ${message}`);
        packResults[index] = null;
      }
    }
  );

  await Promise.all(packTasks);

  // Check how many contexts were successfully packed
  const successfulPacks = packResults.filter((r) => r !== null).length;
  if (successfulPacks === 0) {
    logError("No chapter contexts were packed successfully. Aborting.");
    process.exit(1);
  }

  logStep(`Generating Chapters (Concurrency: ${String(config.CONCURRENCY)})`);

  const generationTasks = chapters.map((chapter, index) => async () => {
    const packResult = packResults[index];
    if (!packResult) {
      logError(`Skipping ${chapter.title} - context packing failed`);
      return { success: false, error: "Context packing failed" };
    }
    return generateOneChapter(config, chapter, packResult);
  });

  // Run with concurrency limit
  const results = await runWithConcurrency(generationTasks, config.CONCURRENCY);

  const successCount = results.filter((r) => r.success).length;
  const failCount = results.filter((r) => !r.success).length;

  logStep("Generation Summary");
  logSuccess(`Generated: ${String(successCount)} chapter(s)`);
  if (failCount > 0) {
    logError(`Failed: ${String(failCount)} chapter(s)`);
    const failedChapters = chapters.filter((_, i) => !results[i]?.success);
    if (failedChapters.length > 0) {
      logWarn("Failed chapters:");
      for (const ch of failedChapters) {
        logWarn(`  - ${ch.title}`);
      }
    }
  }
  logInfo(`Output directory: ${config.OUTPUT_DIR}`);
}

try {
  await main();
} catch (error: unknown) {
  const message = error instanceof Error ? error.message : "Unknown error";
  logError(`Generation failed: ${message}`);
  if (error instanceof Error && error.stack) {
    logDebug(error.stack);
  }
  process.exit(1);
}