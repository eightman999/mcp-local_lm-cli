# MCP Local LM CLI

OllamaによるローカルLLM用のシンプルなMCPサーバーラッパーで、AIアシスタントがModel Context Protocolを通じてローカル言語モデルを使用できるようにします。

## 機能

このサーバーはOllama経由でローカルLLMと連携する3つのツールを提供します：

- `search`: ローカルLLMを使用して質問に対するインテリジェントな回答を提供（Web検索の代わりに知識ベースの回答）
- `chat`: ローカルLLMとの直接的な会話
- `analyzeFile`: マルチモーダル機能を持つローカルLLMを使用したファイル分析（画像、テキスト、PDF）

## 前提条件

- [Ollama](https://ollama.com/)がインストールされ、実行されていること
- 少なくとも1つのモデルがプルされていること（例: `ollama pull llama3.2`）

## 🚀 Claude Codeでのクイックスタート

### 1. Ollamaのセットアップ

まず、Ollamaをインストールして開始します：

```bash
# https://ollama.com/からOllamaをインストール
# モデルをプル
ollama pull llama3.2

# Ollamaサービスを開始（自動開始されていない場合）
ollama serve
```

### 2. MCPサーバーの追加

```bash
claude mcp add -s project local-lm-cli -- npx mcp-local-lm-cli --allow-npx
```

または、以下のインストールオプションセクションに示されている設定でMCPクライアントを設定します。

### 3. 試してみる

プロンプト例：

- **Search**: "TypeScript 5.0の機能について調べて"
- **Chat**: "JavaScriptのasync/awaitとPromiseの違いを説明して"
- **File Analysis**: "llavaモデルを使って/path/to/screenshot.pngの画像を分析して"

## 🔧 インストールオプション

### ローカル開発

1. クローンとインストール：

```bash
git clone https://github.com/choplin/mcp-local-lm-cli
cd mcp-local-lm-cli
npm install
```

1. プロジェクトをビルド：

```bash
npm run build
```

1. Claude Desktopの設定に追加：

```json
{
  "mcpServers": {
    "mcp-local-lm-cli": {
      "command": "node",
      "args": ["/path/to/mcp-local-lm-cli/dist/index.js"]
    }
  }
}
```

### npmパッケージの使用（公開時）

```json
{
  "mcpServers": {
    "mcp-local-lm-cli": {
      "command": "npx",
      "args": ["mcp-local-lm-cli"]
    }
  }
}
```

## 🛠️ 利用可能なツール

### 1. listModels

インストール済みOllamaモデルをインテリジェントな分類で発見・探索。

**パラメータ：**

- `detailed`（オプション）: サイズや更新日などの詳細モデル情報を表示
- `category`（オプション）: カテゴリでフィルタ: "all", "vision", "code", "general", "other"

**機能：**

- 👁️ **ビジョンモデル**: llava, bakllava, cogvlm, moondream
- 💻 **コードモデル**: codellama, deepseek-coder, starcoder, wizardcoder
- 🤖 **汎用モデル**: llama3.x, mistral, gemma, phi, qwen
- 📦 **その他モデル**: 未分類または特殊化モデル

### 2. search

自動モデル選択を備えたローカルLLMを使用してインテリジェントな検索回答を提供。

**パラメータ：**

- `query`（必須）: 検索クエリまたは質問
- `model`（オプション）: 使用する特定のOllamaモデル。指定しない場合は最適な汎用モデルを自動選択
- `maxTokens`（オプション）: 最大応答トークン数
- `temperature`（オプション）: 応答のランダム性（0.0から2.0）

### 3. chat

自動モデル選択を備えたローカルLLMとの直接的な会話。

**パラメータ：**

- `prompt`（必須）: 会話のプロンプト
- `model`（オプション）: 使用する特定のOllamaモデル。指定しない場合は最適な汎用モデルを自動選択
- `stream`（オプション）: ストリーミング応答を有効化
- `temperature`（オプション）: 応答のランダム性（0.0から2.0）

### 4. analyzeFile

ファイルタイプに基づくインテリジェントなモデル選択を持つローカルLLMでファイル分析。

**サポートされているファイルタイプ：**

- **画像**: PNG, JPG, JPEG, GIF, WEBP, BMP（自動的にビジョンモデルを使用）
- **テキスト**: TXT, MD, TEXT, JSON, JS, TS, PY, HTML, CSS（汎用モデルを使用）
- **ドキュメント**: PDF（汎用モデルでの基本サポート）

**パラメータ：**

- `filePath`（必須）: ファイルの絶対パス
- `prompt`（オプション）: 追加の分析指示
- `model`（オプション）: 使用する特定のOllamaモデル。指定しない場合はファイルタイプに基づいて適切なモデルを自動選択
- `temperature`（オプション）: 応答のランダム性（0.0から2.0）

## 💡 プロンプト例

mcp-local-lm-cliの動作を確認するためのプロンプト例：

- **モデル発見**: "利用可能なモデルを一覧表示して" または "ビジョンモデルの詳細情報を見せて"
- **Search**: "最新のTypeScript機能について調べて"
- **Chat**: "mistralモデルを使って量子コンピューティングを簡単な言葉で説明して"
- **File Analysis**: "このコードファイルを分析して: /Users/me/project/main.py"
- **Image Analysis**: "この画像に何が写っているか説明して: /Users/me/Desktop/screenshot.png"（自動的にビジョンモデルを使用）

### 🎯 モデル選択例

- **自動選択**: `chat({ prompt: "こんにちは" })` - 利用可能な最適な汎用モデルを使用
- **特定モデル**: `chat({ prompt: "こんにちは", model: "phi3:mini" })` - 指定されたモデルを使用
- **ビジョンタスク**: `analyzeFile({ filePath: "/path/image.png" })` - ビジョンモデルを自動選択
- **コードタスク**: `chat({ model: "codellama", prompt: "この関数を説明して" })` - コード専用モデルを使用

## 🛠️ 使用例

### search

```typescript
// シンプルな検索
search({ query: "機械学習とは何ですか？" });

// 特定のモデルでの検索
search({
  query: "Dockerコンテナを説明して",
  model: "mistral",
  temperature: 0.3,
});
```

### chat

```typescript
// シンプルなチャット
chat({ prompt: "プログラミングについての俳句を作って" });

// ストリーミングチャット
chat({
  prompt: "関数型プログラミングの利点を説明して",
  model: "codellama",
  stream: true,
});
```

### analyzeFile

```typescript
// 画像の分析
analyzeFile({ 
  filePath: "/path/to/image.png",
  prompt: "この画像にはどんなオブジェクトが写っていますか？",
  model: "llava"
});

// コードの分析
analyzeFile({
  filePath: "/path/to/script.js",
  prompt: "このコードが何をするか説明し、改善案を提案してください"
});
```

## 📝 開発

> **注意**: 開発には[Bun](https://bun.sh)ランタイムが必要です。

### 開発モードで実行

```bash
bun run dev
```

### テストの実行

```bash
bun test
```

### 本番環境向けビルド

```bash
# 開発ビルド
bun run build

# 本番ビルド（ミニファイ版）
bun run build:prod
```

### リンティング・フォーマット

```bash
# コードのリント
bun run lint

# コードのフォーマット
bun run format
```

## 🎯 人気のOllamaモデル

### 汎用

- `llama3.2` - パフォーマンスと能力のバランスが良い
- `llama3.1` - より大きく、より高性能なモデル
- `mistral` - 高速で効率的
- `phi3` - 軽量オプション

### コード専用

- `codellama` - プログラミングタスク専用
- `deepseek-coder` - 高度なコード理解

### マルチモーダル（ビジョン）

- `llava` - 画像分析に最適
- `bakllava` - 代替のビジョンモデル

### モデルのインストール

```bash
ollama pull <model-name>
```

## ⚡ パフォーマンスのヒント

1. **モデル選択**: より高速な応答のため小さなモデル（`phi3`、`llama3.2:1b`）を使用
2. **Temperature**: 事実に関する質問は低い値（0.1-0.3）、創造的なタスクは高い値（0.7-1.0）を使用
3. **ストリーミング**: 長い応答の場合はストリーミングを有効にしてユーザー体験を向上
4. **ハードウェア**: より多くのRAMがあればより大きなモデルをローカルで実行可能

## 🤝 貢献

貢献を歓迎します！プルリクエストをお気軽に送信してください。

## 📄 ライセンス

このプロジェクトはMITライセンスの下でライセンスされています - 詳細はLICENSEファイルを参照してください。

## 📋 変更履歴

### [0.4.0] - 2025-08-06

#### 破壊的変更

- Gemini CLIの代わりにOllamaを使用する完全な書き換え
- ツール名の変更: `googleSearch` → `search`（現在は知識ベースの応答を提供）
- Ollamaモデル互換性のためのすべてのパラメータの更新

#### 新機能

- Ollama API経由のローカルLLMサポート
- ビジョンモデルによる強化されたマルチモーダルファイル分析
- より多くのテキストファイルタイプのサポート（.json, .js, .ts, .py, .html, .css）
- TemperatureとToken制御パラメータ
- ストリーミング応答サポート
- 自動モデル可用性チェック

#### 技術的変更

- 子プロセス起動をOllama API呼び出しに置き換え
- ビジョンモデル用のbase64画像エンコーディング追加
- エラーハンドリングと接続チェックの強化
- Ollamaパラメータ用のすべてのスキーマの更新

### [0.3.1] - 以前

- `which`コマンドによるWindows互換性問題を修正（Gemini CLI版）

## 🔗 関連リンク

- [Model Context Protocol (MCP)](https://modelcontextprotocol.io/)
- [Ollama](https://ollama.com/)
- [Ollama JavaScript Library](https://github.com/ollama/ollama-js)
- [Bun Runtime](https://bun.sh)
