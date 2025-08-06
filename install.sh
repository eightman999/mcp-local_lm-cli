#!/bin/bash

# MCP Local LM CLI - Claude Desktop インストールスクリプト
# このスクリプトは mcp-local-lm-cli を Claude Desktop の MCP サーバーとして設定します

set -e

echo "🚀 MCP Local LM CLI のインストールを開始します..."

# Node.js のバージョンチェック
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js がインストールされていません"
    echo "   https://nodejs.org/ からインストールしてください"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Error: Node.js 18以上が必要です (現在: $(node -v))"
    exit 1
fi

echo "✅ Node.js $(node -v) が見つかりました"

# パッケージのグローバルインストール
echo "📦 mcp-local-lm-cli をインストール中..."
npm install -g mcp-local-lm-cli

# インストール先のパスを取得
MCP_PATH=$(npm list -g mcp-local-lm-cli --depth=0 --parseable 2>/dev/null | head -1)
if [ -z "$MCP_PATH" ]; then
    echo "❌ Error: パッケージのインストールに失敗しました"
    exit 1
fi

MCP_EXECUTABLE="$MCP_PATH/dist/index.js"

# Claude Desktop 設定ディレクトリの作成
CLAUDE_CONFIG_DIR="$HOME/Library/Application Support/Claude"
mkdir -p "$CLAUDE_CONFIG_DIR"

# 既存の設定ファイルのバックアップ
CONFIG_FILE="$CLAUDE_CONFIG_DIR/claude_desktop_config.json"
if [ -f "$CONFIG_FILE" ]; then
    echo "📋 既存の設定ファイルをバックアップ中..."
    cp "$CONFIG_FILE" "$CONFIG_FILE.backup.$(date +%Y%m%d_%H%M%S)"
fi

# 新しい設定ファイルの作成
echo "⚙️  Claude Desktop 設定ファイルを作成中..."
cat > "$CONFIG_FILE" << EOF
{
  "mcpServers": {
    "mcp-local-lm-cli": {
      "command": "node",
      "args": ["$MCP_EXECUTABLE"],
      "env": {}
    }
  }
}
EOF

echo "✅ Claude Desktop 設定ファイルが作成されました: $CONFIG_FILE"

# Ollama のチェック
echo "🔍 Ollama の状態をチェック中..."
if ! command -v ollama &> /dev/null; then
    echo "⚠️  Warning: Ollama がインストールされていません"
    echo "   https://ollama.ai/ からインストールしてください"
else
    echo "✅ Ollama が見つかりました"

    # Ollama サーバーの状態チェック
    if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
        echo "✅ Ollama サーバーが稼働中です"

        # モデルの確認
        MODELS=$(curl -s http://localhost:11434/api/tags | grep -o '"name":"[^"]*"' | cut -d'"' -f4 || echo "")
        if [ -n "$MODELS" ]; then
            echo "✅ 利用可能なモデル:"
            echo "$MODELS" | sed 's/^/   - /'
        else
            echo "⚠️  モデルがインストールされていません"
            echo "   例: ollama pull llama3:latest"
        fi
    else
        echo "⚠️  Ollama サーバーが稼働していません"
        echo "   'ollama serve' でサーバーを起動してください"
    fi
fi

echo ""
echo "🎉 インストールが完了しました！"
echo ""
echo "📝 次のステップ:"
echo "1. Claude Desktop を再起動してください"
echo "2. Ollama サーバーを起動: ollama serve"
echo "3. モデルをインストール: ollama pull llama3:latest"
echo "4. Claude で以下のツールが利用できます:"
echo "   - search: 質問・検索"
echo "   - chat: チャット対話"
echo "   - analyzeFile: ファイル分析"
echo "   - listModels: モデル一覧"
echo ""
echo "🔧 トラブルシューティング:"
echo "   設定ファイル: $CONFIG_FILE"
echo "   実行ファイル: $MCP_EXECUTABLE"
