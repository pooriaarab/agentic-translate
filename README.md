# agentic-translate

Translate one text into a named language.

Dry run is the default. Use `--live` to call DeepL, OpenAI, or Workers AI.

## Install

```sh
npm install agentic-translate
```

## Quick start

```sh
npx agentic-translate translate --text "Hello" --to French
```

This is a dry run. It makes no network request.

## Three uses

### CLI

```sh
agentic-translate translate --text "Hello" --to French --vendor deepl --live
```

Set the matching vendor environment variables before a live call:
`DEEPL_API_KEY`, `OPENAI_API_KEY`, or `CLOUDFLARE_API_TOKEN` and
`CLOUDFLARE_ACCOUNT_ID`.

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

Call the `translate` tool with `text`, `targetLanguage`, and optionally
`vendor`. Set `live: true` only when you want a vendor call.

## License

MIT
