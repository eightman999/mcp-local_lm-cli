# CLAUDE.md（日本語版）

このファイルはClaude Code (claude.ai/code) がこのリポジトリのコードを扱う際のガイダンスを提供します。

## プロジェクト概要

これはOllama経由でローカルLLMを利用するMCP（Model Context Protocol）サーバーラッパーです。MCPプロトコルを通じて3つの主要なツールを公開します：

- `search`: ローカルLLMを使用したインテリジェントな回答提供（Webサーチの代わりに知識ベースの応答）
- `chat`: Ollama経由でのローカルLLMとの直接会話
- `analyzeFile`: マルチモーダルファイル分析（ビジョンモデルによる画像、テキストファイル、基本的なPDFサポート）

プロジェクトはTypeScriptで構築され、Bunをランタイムとして使用し、`index.ts`でシングルファイルアーキテクチャパターンに従います。

## 開発コマンド

**開発ワークフロー:**

```bash
# ホットリロード付きの開発サーバー開始
bun run dev

# テスト実行
bun test

# 統合テストの個別実行
bun test tests/integration

# 開発用ビルド（ソースマップ付き）
bun run build

# 本番用ビルド（ミニファイ、ソースマップなし）
bun run build:prod
```

**コード品質:**

```bash
# TypeScriptコードのリント
bun run lint

# リント問題の自動修正
bun run lint:fix

# Biomeでコードフォーマット
bun run format

# Markdownファイルのリント
bun run lint:md

# Markdownリント問題の修正
bun run lint:md:fix
```

## アーキテクチャ

**コアコンポーネント:**

- `checkOllamaConnection()`: Ollama接続の確認と利用可能モデルの一覧取得
- `executeOllamaChat()`: ストリーミングサポート付きのチャットベース対話処理
- `executeOllamaGenerate()`: シンプルなプロンプト-レスポンス対話処理
- 3つのメインツール実行器: `executeSearch()`, `executeChatConversation()`, `executeFileAnalysis()`
- パラメータ検証用Zodスキーマ: `SearchParametersSchema`, `ChatParametersSchema`, `AnalyzeFileParametersSchema`

**主要機能:**

- Ollama API経由のローカルLLM統合（<http://localhost:11434）>
- 画像分析用ビジョンモデル（llava）でのマルチモーダルサポート
- ビジョンモデル統合用のBase64画像エンコーディング
- より良いUXのためのストリーミング応答サポート
- テキストファイルの強化されたファイルタイプサポート（.json, .js, .ts, .py, .html, .css）
- TemperatureとToken制御パラメータ
- `@modelcontextprotocol/sdk`を使用したMCPプロトコル統合

**ツールパラメータ:**
すべてのツールは共通パラメータをサポート: `model`, `temperature`（0.0-2.0）

- `search`: `query`, `maxTokens`（知識ベースの応答を提供）
- `chat`: `prompt`, `stream`（ストリーミング応答用のboolean）
- `analyzeFile`: `filePath`, `prompt`（オプションの分析指示、画像の場合はllavaがデフォルト）

## 前提条件

- **Ollama**: インストールされ実行されている必要があります（ollama serve）
- **モデル**: 少なくとも1つのモデルがプルされている必要があります（例: `ollama pull llama3.2`）
- **ビジョンモデル**: 画像分析の場合、ビジョンモデルをプルしてください（`ollama pull llava`）

## テスト

プロジェクトはBunの組み込みテストランナーを使用します。統合テストは`tests/integration/tools.test.ts`にあり、モックされたOllama APIレスポンスでコアツール実行機能をテストします。

## 依存関係

- **ランタイム**: Bun（開発に必要）
- **コア**: MCPプロトコル用`@modelcontextprotocol/sdk`、ローカルLLM統合用`ollama`、検証用`zod`
- **開発ツール**: リント/フォーマット用Biome、型用TypeScript、gitフック用lefthook

## ビルド出力

ビルドプロセスはCLI使用のためのshebang付き実行ファイルを`dist/`に作成します。メインエントリーポイントは`dist/index.js`となり、スタンドアロン実行ファイルとして実行できます。

## 人気のOllamaモデル

- **汎用**: `llama3.2`, `llama3.1`, `mistral`, `phi3`
- **コード**: `codellama`, `deepseek-coder`  
- **ビジョン**: `llava`, `bakllava`
- インストール: `ollama pull <model-name>`
