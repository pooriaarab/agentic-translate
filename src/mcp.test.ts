import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { describe, expect, test } from "vitest";
import { createMcpServer } from "./mcp.js";
test("MCP returns the same dry-run shape", async () => { const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair(); const server = createMcpServer(); await server.connect(serverTransport); const client = new Client({ name: "test", version: "1" }); await client.connect(clientTransport); const result = await client.callTool({ name: "translate", arguments: { text: "Hello", targetLanguage: "French" } }); expect(JSON.parse(((result as { content: { text: string }[] }).content[0] as { text: string }).text)).toMatchObject({ dryRun: true, targetLanguage: "French" }); await client.close(); await server.close(); });
