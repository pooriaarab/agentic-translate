import { randomUUID } from "node:crypto";

export type Vendor = "deepl" | "openai" | "workers-ai";

export interface TranslateRequest {
  text: string;
  targetLanguage: string;
  vendor?: Vendor;
  dryRun?: boolean;
}

export interface TranslationResult {
  dryRun: boolean;
  vendor: Vendor;
  text: string;
  targetLanguage: string;
  translation?: string;
  id?: string;
}

export class VendorError extends Error {
  readonly code = "VENDOR_FAILED";
  readonly status?: number;
  constructor(message: string, options: { status?: number; cause?: unknown } = {}) {
    super(message, { cause: options.cause });
    this.name = "VendorError";
    this.status = options.status;
  }
}

export interface VendorAdapter {
  readonly vendor: Vendor;
  translate(text: string, targetLanguage: string): Promise<string>;
}

export interface FetchOptions { fetchFn?: typeof fetch }

function requireKey(name: string): string {
  const key = process.env[name];
  if (!key) throw new VendorError(`${name} is required for a live translation`);
  return key;
}

async function request(fetchFn: typeof fetch, url: string, init: RequestInit, vendor: Vendor): Promise<unknown> {
  let response: Response;
  try { response = await fetchFn(url, init); }
  catch (cause) { throw new VendorError(`${vendor} request failed: ${String(cause)}`, { cause }); }
  const body = await response.text();
  if (!response.ok) throw new VendorError(`${vendor} returned ${response.status}: ${body}`, { status: response.status });
  try { return JSON.parse(body); }
  catch { throw new VendorError(`${vendor} returned invalid JSON: ${body}`); }
}

export class DeepLAdapter implements VendorAdapter {
  readonly vendor = "deepl" as const;
  private readonly fetchFn: typeof fetch;
  constructor(options: FetchOptions = {}) { this.fetchFn = options.fetchFn ?? fetch; }
  async translate(text: string, targetLanguage: string): Promise<string> {
    const key = requireKey("DEEPL_API_KEY");
    const params = new URLSearchParams({ text, target_lang: targetLanguage });
    const data = await request(this.fetchFn, "https://api-free.deepl.com/v2/translate", { method: "POST", headers: { authorization: `DeepL-Auth-Key ${key}`, "content-type": "application/x-www-form-urlencoded" }, body: params }, this.vendor) as { translations?: { text?: unknown }[] };
    const translation = data.translations?.[0]?.text;
    if (typeof translation !== "string") throw new VendorError("deepl response has no translation");
    return translation;
  }
}

export class OpenAIAdapter implements VendorAdapter {
  readonly vendor = "openai" as const;
  private readonly fetchFn: typeof fetch;
  constructor(options: FetchOptions = {}) { this.fetchFn = options.fetchFn ?? fetch; }
  async translate(text: string, targetLanguage: string): Promise<string> {
    const key = requireKey("OPENAI_API_KEY");
    const data = await request(this.fetchFn, "https://api.openai.com/v1/chat/completions", { method: "POST", headers: { authorization: `Bearer ${key}`, "content-type": "application/json" }, body: JSON.stringify({ model: "gpt-4o-mini", messages: [{ role: "system", content: `Translate the user's text into ${targetLanguage}. Return only the translation.` }, { role: "user", content: text }], temperature: 0 }) }, this.vendor) as { choices?: { message?: { content?: unknown } }[] };
    const translation = data.choices?.[0]?.message?.content;
    if (typeof translation !== "string") throw new VendorError("openai response has no translation");
    return translation;
  }
}

export class WorkersAIAdapter implements VendorAdapter {
  readonly vendor = "workers-ai" as const;
  private readonly fetchFn: typeof fetch;
  constructor(options: FetchOptions = {}) { this.fetchFn = options.fetchFn ?? fetch; }
  async translate(text: string, targetLanguage: string): Promise<string> {
    const key = requireKey("CLOUDFLARE_API_TOKEN");
    const account = requireKey("CLOUDFLARE_ACCOUNT_ID");
    const data = await request(this.fetchFn, `https://api.cloudflare.com/client/v4/accounts/${account}/ai/run/@cf/meta/m2m100-1.2b`, { method: "POST", headers: { authorization: `Bearer ${key}`, "content-type": "application/json" }, body: JSON.stringify({ text, target_lang: targetLanguage }) }, this.vendor) as { result?: { translated_text?: unknown } };
    const translation = data.result?.translated_text;
    if (typeof translation !== "string") throw new VendorError("workers-ai response has no translation");
    return translation;
  }
}

export function createVendorAdapter(vendor: Vendor, options: FetchOptions = {}): VendorAdapter {
  if (vendor === "deepl") return new DeepLAdapter(options);
  if (vendor === "openai") return new OpenAIAdapter(options);
  return new WorkersAIAdapter(options);
}

export async function translate(request: TranslateRequest, adapter?: VendorAdapter): Promise<TranslationResult> {
  if (!request.text) throw new Error("text must not be empty");
  if (!request.targetLanguage) throw new Error("targetLanguage must not be empty");
  const vendor = request.vendor ?? "deepl";
  if (request.dryRun !== false) return { dryRun: true, vendor, text: request.text, targetLanguage: request.targetLanguage };
  const liveAdapter = adapter ?? createVendorAdapter(vendor);
  const translation = await liveAdapter.translate(request.text, request.targetLanguage);
  return { dryRun: false, vendor, text: request.text, targetLanguage: request.targetLanguage, translation, id: randomUUID() };
}
