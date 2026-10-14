import { describe, expect, test } from "vitest";
import { createVendorAdapter, translate, VendorError } from "./core.js";

describe("translate", () => {
  test("is a dry run by default", async () => {
    await expect(translate({ text: "Hello", targetLanguage: "French" })).resolves.toEqual({ dryRun: true, vendor: "deepl", text: "Hello", targetLanguage: "French" });
  });
  test("uses a supplied fixture adapter for live work", async () => {
    const result = await translate({ text: "Hello", targetLanguage: "French", vendor: "openai", dryRun: false }, { vendor: "openai", translate: async () => "Bonjour" });
    expect(result).toMatchObject({ dryRun: false, vendor: "openai", translation: "Bonjour" });
  });
  test("does not hide vendor errors", async () => {
    await expect(translate({ text: "Hello", targetLanguage: "French", dryRun: false }, { vendor: "deepl", translate: async () => { throw new VendorError("fixture failure"); } })).rejects.toThrow("fixture failure");
  });
  test("rejects empty input", async () => { await expect(translate({ text: "", targetLanguage: "French" })).rejects.toThrow("text"); });
});

describe("vendor fixtures", () => {
  test("parses a DeepL response", async () => {
    process.env.DEEPL_API_KEY = "fixture";
    const adapter = createVendorAdapter("deepl", { fetchFn: async () => new Response(JSON.stringify({ translations: [{ text: "Bonjour" }] }), { status: 200 }) });
    await expect(adapter.translate("Hello", "FR")).resolves.toBe("Bonjour");
    delete process.env.DEEPL_API_KEY;
  });
  test("reports a missing key clearly", async () => {
    delete process.env.OPENAI_API_KEY;
    await expect(createVendorAdapter("openai").translate("Hello", "French")).rejects.toThrow("OPENAI_API_KEY is required");
  });
});
