# agentic-translate

[![npm version](https://img.shields.io/npm/v/agentic-translate)](https://www.npmjs.com/package/agentic-translate)
[![Downloads/month](https://img.shields.io/npm/dm/agentic-translate)](https://www.npmjs.com/package/agentic-translate)
[![MIT license](https://img.shields.io/npm/l/agentic-translate)](https://opensource.org/license/mit)

[Package](https://www.npmjs.com/package/agentic-translate) · [Support](https://github.com/pooriaarab/agentic-translate/issues)

agentic-translate is an open-source text translation wrapper for DeepL, OpenAI, and Cloudflare Workers AI with a TypeScript API, CLI, and Model Context Protocol (MCP) server.

## Install

```sh
npm install agentic-translate
```

Use Node.js 18 or later. TypeScript declarations are included. The package has two direct runtime dependencies.

## Preview your first translation

```sh
npx agentic-translate translate --text "Hello" --to FR
```

Expect exit code 0 and this JSON:

```json
{"dryRun":true,"vendor":"deepl","text":"Hello","targetLanguage":"FR"}
```

Preview requires no credentials and makes no network request. It confirms request setup, not a translated result.
For a live DeepL request, export `DEEPL_API_KEY`, then add `--live` to that command.
A successful live response contains `dryRun: false`, a `translation` string, and a generated `id`.
The package reads environment variables; it does not load `.env` files.

```js
import { translate } from 'agentic-translate';
console.log(await translate({ text: 'Hello', targetLanguage: 'FR' }));
```

## Features and coverage

- **Vendor selection:** Choose one of three implemented request adapters.
- **Preview:** Dry run is the default for SDK, CLI, and MCP calls.
- **Text input:** Pass text directly or use the CLI `--file` option for a UTF-8 file.
- **Errors:** Expose network, HTTP, invalid JSON, and missing translation failures.

| Integration | Vendor value | Status | Environment | Request target |
| --- | --- | --- | --- | --- |
| DeepL | `deepl` | Implemented; live verification pending | `DEEPL_API_KEY` | DeepL API Free `/v2/translate` |
| OpenAI | `openai` | Implemented; live verification pending | `OPENAI_API_KEY` | Chat Completions, `gpt-4o-mini` |
| Cloudflare Workers AI | `workers-ai` | Implemented; live verification pending | `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` | `@cf/meta/m2m100-1.2b` |

All three adapters have request code and mocked tests; none is a scaffold.
This campaign performs zero live credential checks. Preview execution is verified locally.

## Runtime surfaces and limits

The CLI has one command, `translate`, plus `--help`/`-h` and `--version`/`-V`.
Pass `--text` or `--file`, `--to`, optional `--vendor`, and optional `--live`.
Use `npx agentic-translate-mcp` to start stdio MCP. The CLI has no `mcp` subcommand.
The single MCP tool, `translate`, accepts `text`, `targetLanguage`, optional `vendor`, and optional `live`.

The SDK enables live requests with `dryRun: false` and accepts a custom `VendorAdapter` as its second argument.
Built-in adapter constructors accept `fetchFn` for request injection.
Language values pass through unchanged; use the selected vendor's accepted language format.
The DeepL endpoint and model names are fixed in source. Cloudflare requests omit a source-language field.

There is no automatic retry, timeout option, streaming, language validation, or batch translation API.
The generated result ID is a local UUID, not a vendor job ID.
The Worker source and its tests are disabled; no active Worker endpoint ships.

## Status and links

Version 0.1.1 is an early release. APIs can change before 1.0.
Use [GitHub issues](https://github.com/pooriaarab/agentic-translate/issues) for support.
No public documentation site is configured. Public case studies are not yet published.

## License

MIT.
