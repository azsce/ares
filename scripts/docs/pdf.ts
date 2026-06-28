#!/usr/bin/env bun

import { resolve } from "node:path";
import { execSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import {
  logStep,
  logInfo,
  logSuccess,
  logError,
  printBanner,
} from "./lib/logger";

const QUARTO_EXE =
  process.env.QUARTO_PATH ||
  "C:\\Users\\PC\\AppData\\Local\\Programs\\Quarto\\bin\\quarto.exe";

const ROOT_DIR = import.meta.dirname;
const PDF_DIR = resolve(ROOT_DIR, "_pdf");

function findQuarto(): string {
  if (existsSync(QUARTO_EXE)) return QUARTO_EXE;
  try {
    const which = execSync("where.exe quarto", { encoding: "utf-8" })
      .trim()
      .split("\n")[0]
      ?.trim();
    if (which && existsSync(which)) return which;
  } catch (_e) { /* quarto not on PATH */ }
  throw new Error(
    "Quarto CLI not found. Install from https://quarto.org or set QUARTO_PATH env var."
  );
}

function countPdfPages(pdfPath: string): number {
  const buf = readFileSync(pdfPath);
  const text = buf.toString("latin1");
  const pageObjMatches = text.match(/\/Type\s*\/Page(?!\s*s)\b/g);
  if (pageObjMatches && pageObjMatches.length > 0) return pageObjMatches.length;
  const countMatch = text.match(/\/N\s+(\d+)/);
  if (countMatch?.[1]) return parseInt(countMatch[1], 10);
  return 0;
}

function findChrome(): string | null {
  const envChrome = process.env["CHROME_PATH"] || process.env["PUPPETEER_EXECUTABLE_PATH"];
  if (envChrome && existsSync(envChrome)) return envChrome;

  const searchPaths = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  ];
  for (const p of searchPaths) {
    if (existsSync(p)) return p;
  }

  try {
    const result = execSync("where.exe chrome", { encoding: "utf-8", timeout: 5_000 }).trim();
    const firstLine = result.split("\n")[0]?.trim();
    if (firstLine && existsSync(firstLine)) return firstLine;
  } catch { /* chrome not on PATH */ }

  return null;
}

function ensureMermaidEnv(): void {
  const chromePath = findChrome();
  if (chromePath) {
    process.env["PUPPETEER_EXECUTABLE_PATH"] = chromePath;
    process.env["CHROME_PATH"] = chromePath;
  }
}

function main(): void {
  const args = process.argv.slice(2);
  const countOnly = args.includes("--count-only");
  const clean = args.includes("--clean");

  printBanner();

  ensureMermaidEnv();

  const quarto = findQuarto();
  logInfo(`Quarto: ${quarto}`);
  logInfo(`Quarto version: ${execSync(`"${quarto}" --version`, { encoding: "utf-8" }).trim()}`);

  const pdfFile = resolve(PDF_DIR, "ares-docs.pdf");
  if (countOnly && existsSync(pdfFile)) {
    const pages = countPdfPages(pdfFile);
    logSuccess(`PDF page count: ${String(pages)}`);
    return;
  }

  if (clean && existsSync(PDF_DIR)) {
    logInfo("Cleaning previous build...");
    execSync(`Remove-Item -Recurse -Force "${PDF_DIR}"`, {
      shell: "pwsh",
      stdio: "pipe",
    });
  }

  logStep("Rendering PDF with Quarto");
  logInfo(`Working dir: ${ROOT_DIR}`);

  try {
    execSync(`"${quarto}" render --to pdf`, {
      cwd: ROOT_DIR,
      encoding: "utf-8",
      stdio: "inherit",
      timeout: 10 * 60 * 1000,
    });
  } catch {
    logError("Quarto render failed. See output above for LaTeX errors.");
    process.exit(1);
  }

  if (existsSync(pdfFile)) {
    const pages = countPdfPages(pdfFile);
    const sizeBytes = statSync(pdfFile).size;
    const sizeMB = (sizeBytes / 1024 / 1024).toFixed(1);
    logSuccess(`PDF generated: ${pdfFile} (${sizeMB} MB)`);
    logSuccess(`Accurate page count: ${String(pages)} A4 pages`);
  } else {
    logError("PDF file not found after render. Check Quarto output for errors.");
    process.exit(1);
  }
}

try {
  main();
} catch (error: unknown) {
  const message = error instanceof Error ? error.message : "Unknown error";
  logError(`PDF generation failed: ${message}`);
  process.exit(1);
}
