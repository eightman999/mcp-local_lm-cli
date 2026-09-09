# mcp-local_lm-cli — RETIRED

> **Status: retired (2026-09-09).**
>
> このリポジトリはローカルLLM / MCP接続を試すための実験forkで、新規開発・利用案内を終了しました。

## Why retired

- provider / runtimeごとのMCP wrapperを個別repoとして増やす方式を採用しないため
- local LLMを含む推論resourceは、現在 `eightman999/kamimusuhi` のprovider-neutral resource slot / router / adapter境界へ統合する方針のため
- model knowledgeを `search` として露出する旧APIは、retrieval provenanceを曖昧にするため継承しないため

## Distilled lessons

有用だった設計知識は以下へ蒸留済みです。

- `eightman999/kamimusuhi/docs/legacy-project-distillation-2026-09-09.md`

特に、model discovery / invoke / health、capability-based routing、locality/privacy、OpenAI-compatible endpoint、secret非保存を現行設計へ引き継いでいます。

## Historical status

このrepoは `choplin/mcp-gemini-cli` を起点としたforkです。コードと履歴は実験記録として残しますが、Kamimusuhiの正典実装ではありません。
