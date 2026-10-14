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
  test.each([
    ["deepl", "DEEPL_API_KEY", "https://api-free.deepl.com/v2/translate", { translations: [{ text: "Bonjour" }] }],
    ["openai", "OPENAI_API_KEY", "https://api.openai.com/v1/chat/completions", { choices: [{ message: { content: "Bonjour" } }] }],
    ["workers-ai", "CLOUDFLARE_API_TOKEN", "https://api.cloudflare.com/client/v4/accounts/fixture-account/ai/run/@cf/meta/m2m100-1.2b", { result: { translated_text: "Bonjour" } }],
  ] as const)("calls the real %s HTTPS host with a fake fetch", async (vendor, keyName, host, body) => {
    process.env[keyName] = "fixture";
    if (vendor === "workers-ai") process.env.CLOUDFLARE_ACCOUNT_ID = "fixture-account";
    const fetchFn = async (input: string | URL | Request) => {
      expect(String(input)).toBe(host);
      return new Response(JSON.stringify(body), { status: 200 });
    };
    await expect(createVendorAdapter(vendor, { fetchFn }).translate("Hello", "FR")).resolves.toBe("Bonjour");
    delete process.env[keyName];
    delete process.env.CLOUDFLARE_ACCOUNT_ID;
  });

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
