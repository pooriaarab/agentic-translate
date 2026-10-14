import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { translate, VendorError } from "./core.js";
import { VERSION } from "./version.js";
const vendors = ["deepl", "openai", "workers-ai"] as const;
export function createMcpServer(): McpServer {
  const server = new McpServer({ name: "agentic-translate", version: VERSION });
  server.registerTool("translate", { description: "Translate one text into a named language. Dry run is the default.", inputSchema: { text: z.string(), targetLanguage: z.string(), vendor: z.enum(vendors).optional(), live: z.boolean().optional() } }, async ({ text, targetLanguage, vendor, live }) => {
    try { return { content: [{ type: "text" as const, text: JSON.stringify(await translate({ text, targetLanguage, vendor, dryRun: !live })) }] }; }
    catch (error) { const message = error instanceof Error ? error.message : String(error); return { content: [{ type: "text" as const, text: JSON.stringify({ error: message }) }], isError: true }; }
  });
  return server;
}
export async function startMcp(): Promise<void> { const server = createMcpServer(); await server.connect(new StdioServerTransport()); }
