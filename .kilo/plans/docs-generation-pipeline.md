# Plan: Automated Documentation Generation Pipeline (`scripts/docs`)

## Overview

Create an independent TypeScript/Bun project at `scripts/docs/` that fully automates academic documentation generation for the Ares graduation project. It packs the repository context using Repomix (as a library), splits context to fit the AI model's token limit, and generates all required chapters via an OpenAI-compatible API.

---

## 1. Project Structure

```
scripts/docs/
├── .env.example          # Template with all required keys
├── .env                  # User's actual keys (gitignored)
├── .gitignore            # Same pattern as scripts/setup
├── .prettierrc           # Same as scripts/setup
├── eslint.config.ts      # Same stack as scripts/setup
├── cspell.config.yaml    # Project-specific words
├── tsconfig.json         # Same config as scripts/setup
├── package.json          # @ares/docs - independent bun project
├── repomix.config.json   # Repomix config for this project
├── generate.ts           # Main entry point (like setup.ts)
├── index.ts              # Orchestration logic (like setup/index.ts)
├── chapters.ts           # Chapter definitions & prompts
├── lib/
│   ├── colors.ts         # Copied from scripts/setup
│   ├── logger.ts         # Copied from scripts/setup
│   ├── config.ts         # .env loading + Zod validation
│   ├── repomix.ts        # Repomix integration (pack repo, get context, split)
│   ├── ai-client.ts      # OpenAI SDK wrapper (baseURL from .env)
│   ├── token-utils.ts    # Token counting, split calculation
│   └── output.ts         # File writing, markdown cleanup
└── README.md             # Usage instructions
```

---

## 2. `.env.example`

```env
# OpenAI-compatible API configuration
CUSTOM_API_ENDPOINT=https://your-custom-endpoint.com/v1
CUSTOM_API_KEY=your-secret-key

# Model configuration
AI_MODEL=gpt-4o

# Token limits
MAX_INPUT_TOKENS=128000

# Output configuration
OUTPUT_DIR=../../docs
COMPRESS_CONTEXT=true
INCLUDE_PATTERNS=backend/**/*.cs,frontend/src/**/*.ts,frontend/src/**/*.tsx,frontend/src/**/*.css,**/*.md,**/*.json,!**/*.test.*,!**/*.spec.*
IGNORE_PATTERNS=**/node_modules/**,**/dist/**,**/build/**,**/.next/**,**/coverage/**,scripts/docs/**,car-rental-system-docs/**,pending-features/**,scratch_*

# Repomix options
REPOMIX_STYLE=markdown
INCLUDE_GIT_LOGS=false
INCLUDE_GIT_DIFFS=false
REMOVE_COMMENTS=false
REMOVE_EMPTY_LINES=true
```

---

## 3. `package.json`

```json
{
  "name": "@ares/docs",
  "version": "1.0.0",
  "description": "Ares documentation generation pipeline",
  "module": "index.ts",
  "type": "module",
  "private": true,
  "scripts": {
    "generate": "bun run generate.ts",
    "generate:ch3": "bun run generate.ts --chapter 3",
    "generate:ch4": "bun run generate.ts --chapter 4",
    "generate:appendix": "bun run generate.ts --chapter appendix",
    "generate:all": "bun run generate.ts --all",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "typecheck": "tsgo -b --noEmit --extendedDiagnostics"
  },
  "dependencies": {
    "chalk": "^5.6.2",
    "openai": "^4.104.0",
    "ora": "^9.3.0",
    "repomix": "^1.3.0",
    "zod": "^4.3.6"
  },
  "devDependencies": {
    "@cspell/dict-ar": "^1.1.7",
    "@cspell/eslint-plugin": "^10.0.0",
    "@eslint/js": "^10.0.1",
    "@types/bun": "latest",
    "@typescript-eslint/eslint-plugin": "^8.58.2",
    "@typescript-eslint/parser": "^8.58.2",
    "@typescript/native-preview": "^7.0.0-dev.20260415.1",
    "eslint": "^10.2.0",
    "eslint-plugin-sonarjs": "^4.0.2",
    "globals": "^17.5.0",
    "jiti": "^2.6.1",
    "prettier": "^3.8.3",
    "typescript-eslint": "^8.58.2"
  },
  "peerDependencies": {
    "typescript": "^5"
  }
}
```

---

## 4. Core Architecture

### 4.1 Chapter Definitions (`chapters.ts`)

Define each chapter as a typed object:

```typescript
interface ChapterConfig {
  id: string;
  filename: string;
  title: string;
  systemPrompt: string;
  userPrompt: string;
}
```

Chapters to generate (from `docs/ai_setup_instructions_ts.md` and `docs/project_template_content.md`):

1. **Chapter 1: Introduction** (`chapter_1_introduction.md`)
2. **Chapter 2: Background Materials** (`chapter_2_background.md`)
3. **Chapter 3: System Design** (`chapter_3_system_design.md`)
4. **Chapter 4: Results and Discussion** (`chapter_4_results.md`)
5. **Chapter 5: Conclusion and Future Work** (`chapter_5_conclusion.md`)
6. **Appendix A: File Structure & Execution** (`appendix_a.md`)
7. **Appendix B: References** (`appendix_b_references.md`)

Each chapter will have a crafted prompt that instructs the AI to follow Al-Azhar University rubric.

### 4.2 Repomix Integration (`lib/repomix.ts`)

Use Repomix as a **library** (not CLI) to avoid `bun x`/`npx` calls and get programmatic control:

```typescript
import { runCli, type CliOptions } from "repomix";
```

**Flow:**
1. Call `runCli()` with options derived from `.env` (style, compress, include/ignore patterns)
2. Capture the packed output string
3. Use Repomix's built-in token count (`packResult.totalTokens`) to compare against `MAX_INPUT_TOKENS`
4. If total tokens > max, use `--split-output` or re-pack with `--compress` enabled
5. Return the context string (or array of strings if split) to the caller

**Key design:** The `.env` `MAX_INPUT_TOKENS` controls how much context we can send per API call. We reserve ~4000 tokens for the prompt/outstruction overhead and ~4000 tokens for the model's response. So the usable context = `MAX_INPUT_TOKENS - 8000`. If the packed repo exceeds this, we:
- First try with `--compress` (Tree-sitter, ~70% token reduction)
- If still too large, split into chunks and send each chunk as a separate context piece, asking the AI to generate the chapter based on the chunk, then merge
- Alternatively, use `--include` to only include relevant source directories per chapter (e.g., Ch3 System Design gets backend + frontend source, Ch4 Results gets test files + config)

### 4.3 AI Client (`lib/ai-client.ts`)

```typescript
import OpenAI from "openai";
```

- Initialize with `baseURL: process.env.CUSTOM_API_ENDPOINT` and `apiKey: process.env.CUSTOM_API_KEY`
- Use `chat.completions.create()` (not `responses.create()`) for maximum compatibility with custom OpenAI-compatible endpoints
- Send `model: process.env.AI_MODEL` (user configures the model name)
- System message = chapter-specific system prompt
- User message = chapter user prompt + repomix context
- Parse response: `completion.choices[0].message.content`
- Strip any markdown codeblock wrappers (````markdown ... ````)

### 4.4 Token Utils (`lib/token-utils.ts`)

- Use `gpt-tokenizer` (bundled by repomix) or implement a simple estimator (~4 chars per token)
- Calculate: `contextTokens = totalTokens`, `promptOverhead = ~4000`, `responseReserve = ~4000`
- Determine if context fits: `contextTokens + promptOverhead + responseReserve <= MAX_INPUT_TOKENS`
- If not: calculate split chunk count and chunk size

### 4.5 Output (`lib/output.ts`)

- Write raw markdown to `docs/{filename}.md`
- Strip markdown codeblock wrappers from AI response
- Validate the output starts with the expected heading
- Log file paths and sizes

---

## 5. Main Flow (`index.ts`)

```
1. Load & validate .env (Zod schema)
2. Print banner
3. Pack repository with Repomix
   - Start spinner "Packing repository..."
   - Call runCli() with options from .env
   - Report total files, total tokens
4. Check token budget
   - If over limit: try with compress, then split
5. For each chapter (or selected chapter):
   a. Start spinner "Generating Chapter N..."
   b. Build messages: system prompt + user prompt + context
   c. Call OpenAI API
   d. Clean response (strip wrappers)
   e. Write to docs/{filename}.md
   f. Stop spinner, report success + file size
6. Summary: list all generated files with sizes
```

---

## 6. CLI Arguments (`generate.ts`)

```
bun run generate.ts              # Interactive: choose which chapters
bun run generate.ts --all        # Generate all chapters
bun run generate.ts --chapter 3  # Generate only chapter 3
bun run generate.ts --chapter 4  # Generate only chapter 4
bun run generate.ts --chapter appendix  # Generate appendices
bun run generate.ts --compress   # Force compress even if under token limit
bun run generate.ts --debug      # Verbose logging
bun run generate.ts --dry-run    # Pack repo + count tokens, don't call API
```

---

## 7. Configuration Files

### `.gitignore` (same as scripts/setup)

### `tsconfig.json` (same as scripts/setup)

### `eslint.config.ts` (same stack as scripts/setup - strictTypeChecked, cspell, sonarjs)

### `cspell.config.yaml` - project-specific words: repomix, openai, pandoc, quarto, al-azhar, etc.

### `repomix.config.json`

```json
{
  "output": {
    "style": "markdown",
    "compress": true,
    "removeEmptyLines": true,
    "fileSummary": true,
    "directoryStructure": true,
    "topFilesLength": 10
  },
  "include": [
    "backend/**/*.cs",
    "frontend/src/**/*.ts",
    "frontend/src/**/*.tsx",
    "**/*.md"
  ],
  "ignore": {
    "customPatterns": [
      "scripts/docs/**",
      "car-rental-system-docs/**",
      "pending-features/**",
      "**/node_modules/**",
      "**/dist/**",
      "**/.next/**",
      "**/*.test.*",
      "**/*.spec.*"
    ]
  },
  "security": {
    "enableSecurityCheck": true
  },
  "tokenCount": {
    "encoding": "o200k_base"
  }
}
```

---

## 8. Root `package.json` Integration

Add convenience scripts to root `package.json`:

```json
"generate-docs": "bun run --cwd scripts/docs generate",
"generate-docs:all": "bun run --cwd scripts/docs generate --all",
"generate-docs:ch3": "bun run --cwd scripts/docs generate --chapter 3",
"lint:docs": "bun run --cwd scripts/docs lint",
"typecheck:docs": "bun run --cwd scripts/docs typecheck"
```

Update `lint:all` and `typecheck:all` to include docs scripts.

---

## 9. Chapter Prompt Design

Each chapter prompt will:
1. Identify the chapter number and title
2. Reference the Al-Azhar University rubric (from `project_template_content.md`)
3. Instruct the AI to write in raw markdown (no codeblock wrappers)
4. Specify required sections and subsections
5. Include the full repomix context as reference material
6. Specify formatting rules (headings, structure)

**Prompt template:**

```
You are generating documentation for an Al-Azhar University graduation project.

[Chapter-specific rubric text from project_template_content.md]

Using the following repository context, generate [CHAPTER TITLE].

Repository context:
{repomix_output}

Requirements:
- Output raw Markdown only, no codeblock wrappers
- Start with '# CHAPTER N: TITLE'
- Follow the rubric structure exactly
- Be thorough but focused - do not list every minor function
- Include diagrams descriptions where helpful (Mermaid syntax)

{chapter_specific_instructions}
```

---

## 10. Smart Context Strategy

To avoid exceeding token limits, the script implements a **tiered approach**:

1. **Full pack** → check token count against `MAX_INPUT_TOKENS - 8000`
2. **If over**: Try with `--compress` (Tree-sitter extraction, ~70% reduction)
3. **If still over**: Use chapter-specific `--include` patterns to only include relevant code
4. **Last resort**: Split into chunks, generate partial content per chunk, then ask AI to merge

---

## 11. Steps to Execute

1. Create `scripts/docs/` directory
2. Create `package.json` with dependencies
3. Run `bun install` inside `scripts/docs/`
4. Create `.env.example` and `.gitignore`
5. Create `tsconfig.json` (copy from setup, adjust if needed)
6. Create `eslint.config.ts` (copy from setup, adjust rules for docs tool)
7. Create `.prettierrc` (copy from setup)
8. Create `cspell.config.yaml`
9. Create `repomix.config.json`
10. Create `lib/colors.ts` (copy from setup)
11. Create `lib/logger.ts` (copy from setup)
12. Create `lib/config.ts` - Zod schema for .env, load/validate
13. Create `lib/token-utils.ts` - token estimation and split logic
14. Create `lib/repomix.ts` - Repomix library integration
15. Create `lib/ai-client.ts` - OpenAI SDK wrapper
16. Create `lib/output.ts` - file writing and cleanup
17. Create `chapters.ts` - chapter definitions and prompts
18. Create `index.ts` - main orchestration
19. Create `generate.ts` - CLI entry point
20. Update root `package.json` with convenience scripts
21. Run `bun run typecheck`, `bun run lint`, `bun run format:check`
22. Test with `--dry-run` to verify repomix packing
