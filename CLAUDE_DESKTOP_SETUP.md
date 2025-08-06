# Claude Desktop MCP インストールガイド

このガイドでは、MCP Local LM CLI を Claude Desktop の MCP サーバーとして設定する方法を説明します。

## 🎯 概要

MCP Local LM CLI を使用すると、Claude Desktop から直接ローカルの Ollama モデルにアクセスできます：

- **プライバシー保護**: すべての処理がローカルで実行
- **高速応答**: ネットワーク遅延なし
- **コスト削減**: API料金不要
- **カスタマイズ可能**: 任意のOllamaモデルを使用

## 🛠️ 前提条件

- **Node.js 18以上**
- **Claude Desktop アプリ**
- **Ollama** (ローカルLLMランタイム)

## 🚀 ワンクリックインストール

### 方法1: 自動インストールスクリプト (推奨)

```bash
curl -fsSL https://raw.githubusercontent.com/choplin/mcp-local-lm-cli/main/install.sh | bash
```

### 方法2: 手動インストール

#### Step 1: パッケージのインストール

```bash
npm install -g mcp-local-lm-cli
```

#### Step 2: Claude Desktop設定

```bash
# 設定ディレクトリを作成
mkdir -p ~/Library/Application\ Support/Claude

# 設定ファイルを作成
cat > ~/Library/Application\ Support/Claude/claude_desktop_config.json << 'EOF'
{
  "mcpServers": {
    "mcp-local-lm-cli": {
      "command": "mcp-local-lm-cli",
      "args": [],
      "env": {}
    }
  }
}
EOF
```

#### Step 3: Ollamaのセットアップ

```bash
# Ollamaをインストール (未インストールの場合)
curl -fsSL https://ollama.ai/install.sh | sh

# Ollamaサーバーを起動
ollama serve

# モデルをダウンロード (別ターミナル)
ollama pull llama3:latest
ollama pull llama3.2:1b  # 軽量版
```

#### Step 4: Claude Desktopを再起動

Claude Desktop アプリを完全に終了してから再起動してください。

## 🎮 使用方法

Claude Desktop で以下のようにツールを使用できます：

### 検索・質問応答

```text
search: "Pythonの非同期プログラミングについて教えて"
```

### チャット対話

```text
chat: "TypeScriptの型システムの利点を説明して"
```

### ファイル分析

```text
analyzeFile: この画像ファイルを分析して: /path/to/image.png
```

### モデル管理

```text
listModels: 利用可能なモデルを表示して
```

## 🔧 トラブルシューティング

### Claude DesktopでMCPサーバーが認識されない

1. **設定ファイルの確認**:

   ```bash
   cat ~/Library/Application\ Support/Claude/claude_desktop_config.json
   ```

2. **Claude Desktopの完全再起動**:
   - メニューバーから「Claude」→「Quit Claude」
   - Dockからアプリを再起動

3. **パッケージのインストール確認**:

   ```bash
   which mcp-local-lm-cli
   npm list -g mcp-local-lm-cli
   ```

### Ollamaに接続できない

1. **Ollamaサーバーの状態確認**:

   ```bash
   curl http://localhost:11434/api/tags
   ```

2. **Ollamaサーバーの起動**:

   ```bash
   ollama serve
   ```

3. **モデルの確認**:

   ```bash
   ollama list
   ```

### パフォーマンスの最適化

1. **軽量モデルの使用**:

   ```bash
   ollama pull llama3.2:1b
   ollama pull phi3:mini
   ```

2. **GPU加速の有効化** (対応環境):
   - Ollamaは自動的にGPUを検出・使用します

## 🔄 アップデート

パッケージを最新版に更新するには：

```bash
npm update -g mcp-local-lm-cli
```

Claude Desktop を再起動してください。

## 📋 設定のカスタマイズ

### 環境変数の設定

```json
{
  "mcpServers": {
    "mcp-local-lm-cli": {
      "command": "mcp-local-lm-cli",
      "args": [],
      "env": {
        "OLLAMA_HOST": "http://localhost:11434",
        "DEFAULT_MODEL": "llama3:latest"
      }
    }
  }
}
```

### 複数のOllamaサーバー

```json
{
  "mcpServers": {
    "mcp-local-lm-cli": {
      "command": "mcp-local-lm-cli",
      "args": [],
      "env": {
        "OLLAMA_HOST": "http://localhost:11434"
      }
    },
    "mcp-local-lm-cli-gpu": {
      "command": "mcp-local-lm-cli",
      "args": [],
      "env": {
        "OLLAMA_HOST": "http://gpu-server:11434"
      }
    }
  }
}
```

## 🆘 サポート

問題が発生した場合：

1. [GitHub Issues](https://github.com/choplin/mcp-local-lm-cli/issues) で報告
2. ログファイルの確認：

   ```bash
   tail -f ~/.claude/logs/claude.log
   ```

3. 設定の初期化：

   ```bash
   rm ~/Library/Application\ Support/Claude/claude_desktop_config.json
   # 再インストール
   ```

## 🎉 成功の確認

インストールが成功すると、Claude Desktop で：

1. 新しいツールアイコンが表示される
2. 「利用可能なモデルを表示して」で Ollama モデルが一覧表示される
3. ローカルLLMからの応答が得られる

これで Claude Desktop から完全にプライベートなAI機能をお楽しみいただけます！
