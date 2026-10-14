# agentic-translate

agentic-translate is a CLI, MCP tool, and library that translates text with DeepL, OpenAI, or Cloudflare Workers AI.

Dry run is the default. It exits successfully and makes no network request. Use `--live` only when you want a vendor call.

## Install

```sh
npm install agentic-translate
```

## Quick start

```sh
npx agentic-translate translate --text "Hello" --to French
```

This is a dry run. It makes no network request.

## Live vendors

Set the environment key before a live call.

| Brand | Environment key | Live command |
| --- | --- | --- |
| DeepL | `DEEPL_API_KEY` | `agentic-translate translate --text "Hello" --to FR --vendor deepl --live` |
| OpenAI | `OPENAI_API_KEY` | `agentic-translate translate --text "Hello" --to French --vendor openai --live` |
| Cloudflare Workers AI | `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` | `agentic-translate translate --text "Hello" --to French --vendor workers-ai --live` |

## Three uses

### CLI

```sh
agentic-translate translate --text "Hello" --to French --vendor deepl --live
```

### Library

```js
import { translate } from "agentic-translate";

const result = await translate({ text: "Hello", targetLanguage: "French" });
console.log(result);
```

### MCP

```sh
npx agentic-translate mcp
```

Call the `translate` tool with `text`, `targetLanguage`, and optionally `vendor`.
Set `live: true` only when you want a vendor call.

## License

MIT
