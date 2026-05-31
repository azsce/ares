import { Glob, write, file } from "bun";
import { mkdir, existsSync } from "node:fs";
import { join } from "node:path";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB limit per combined file
const OUTPUT_DIR = "combined_chunks";
const PROJECT_ROOT = process.cwd();

async function run() {
  if (!existsSync(OUTPUT_DIR)) {
    mkdir(OUTPUT_DIR, { recursive: true }, err => {
      if (err) throw err;
    });
  }

  const tsxGlob = new Glob("**/*.tsx");
  const tsxFiles: string[] = [];

  // Find all .tsx files, excluding node_modules and the output directory
  for await (const path of tsxGlob.scan(PROJECT_ROOT)) {
    if (path.includes("node_modules") || path.startsWith(OUTPUT_DIR) || path.includes(".next")) continue;
    tsxFiles.push(join(PROJECT_ROOT, path));
  }

  console.log(`Found ${tsxFiles.length} .tsx files.`);

  let partNumber = 1;
  let currentContent = "";
  let currentSize = 0;

  for (const filePath of tsxFiles) {
    try {
      const tsxFile = file(filePath);
      const content = await tsxFile.text();

      const header = `\n\n// --- START OF FILE: ${filePath} ---\n`;
      const footer = `\n// --- END OF FILE: ${filePath} ---\n`;
      const fullFileContent = header + content + footer;
      const fileSize = Buffer.byteLength(fullFileContent, "utf8");

      if (currentSize + fileSize > MAX_SIZE && currentContent.length > 0) {
        const outputFileName = join(OUTPUT_DIR, `combined_tsx_part${partNumber}.tsx`);
        await write(outputFileName, currentContent);
        console.log(`Saved ${outputFileName} (Size: ${(currentSize / 1024 / 1024).toFixed(2)} MB)`);
        partNumber++;
        currentContent = "";
        currentSize = 0;
      }

      currentContent += fullFileContent;
      currentSize += fileSize;
    } catch (e) {
      console.error(`Error reading ${filePath}:`, e);
    }
  }

  if (currentContent.length > 0) {
    const outputFileName = join(OUTPUT_DIR, `combined_tsx_part${partNumber}.tsx`);
    await write(outputFileName, currentContent);
    console.log(`Saved ${outputFileName} (Size: ${(currentSize / 1024 / 1024).toFixed(2)} MB)`);
  }
}

run().catch(console.error);
