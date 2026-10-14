import { describe, expect, test, vi } from "vitest";
import { runCli } from "./cli.js";
describe("cli", () => {
  test("prints a dry-run JSON result", async () => { const log = vi.spyOn(console, "log").mockImplementation(() => undefined); expect(await runCli(["translate", "--text", "Hello", "--to", "French"])).toBe(0); expect(JSON.parse(String(log.mock.calls[0][0]))).toMatchObject({ dryRun: true, vendor: "deepl" }); log.mockRestore(); });
  test("needs a target language", async () => { const error = vi.spyOn(console, "error").mockImplementation(() => undefined); expect(await runCli(["translate", "--text", "Hello"])).toBe(2); error.mockRestore(); });
});
