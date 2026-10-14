#!/usr/bin/env node
import { readFileSync, realpathSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { translate, type Vendor, VendorError } from "./core.js";
import { VERSION } from "./version.js";

const vendors = ["deepl", "openai", "workers-ai"] as const;
function usage(): string { return `agentic-translate ${VERSION}\n\nUsage: agentic-translate translate --text <text> --to <language> [--vendor deepl|openai|workers-ai] [--live]\n\nDry run is the default. Use --live to call a vendor.`; }
export async function runCli(argv: string[]): Promise<number> {
  if (!argv.length || argv.includes("--help") || argv.includes("-h")) { console.log(usage()); return 0; }
  if (argv[0] === "--version" || argv[0] === "-V") { console.log(VERSION); return 0; }
  if (argv.shift() !== "translate") { console.error("unknown command"); return 2; }
  let text: string | undefined; let file: string | undefined; let targetLanguage: string | undefined; let vendor: Vendor = "deepl"; let live = false;
  while (argv.length) { const flag = argv.shift(); const value = argv.shift(); if (flag === "--live") { live = true; if (value) argv.unshift(value); } else if (flag === "--text") text = value; else if (flag === "--file") file = value; else if (flag === "--to") targetLanguage = value; else if (flag === "--vendor" && vendors.includes(value as Vendor)) vendor = value as Vendor; else { console.error(`invalid flag or value: ${flag}`); return 2; } }
  if (!text && file) text = readFileSync(file, "utf8");
  if (!text || !targetLanguage) { console.error("translate needs --text or --file, and --to"); return 2; }
  try { console.log(JSON.stringify(await translate({ text, targetLanguage, vendor, dryRun: !live }))); return 0; }
  catch (error) { console.error(`${error instanceof VendorError ? error.name : "Error"}: ${error instanceof Error ? error.message : String(error)}`); return 1; }
}
function isMain(): boolean { try { return import.meta.url === pathToFileURL(realpathSync(process.argv[1] ?? "")).href; } catch { return false; } }
if (isMain()) runCli(process.argv.slice(2)).then((code) => { if (code) process.exit(code); });
