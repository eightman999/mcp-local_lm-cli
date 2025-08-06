# MCP Local LM CLI

A simple MCP server wrapper for local LLMs via Ollama that enables AI assistants to use local language models through the Model Context Protocol.

## What it does

This server exposes three tools that interact with local LLMs via Ollama:

- `search`: Provides intelligent answers to queries using local LLMs (replaces web search with knowledge-based responses)
- `chat`: Sends prompts directly to local LLMs for general conversations
- `analyzeFile`: Analyzes files (images, text, PDFs) using local LLMs with multimodal capabilities

## Prerequisites

- [Ollama](https://ollama.com/) installed and running
- At least one model pulled (e.g., `ollama pull llama3.2`)

## 🚀 Quick Start with Claude Code

### 1. Setup Ollama

First, install and start Ollama:

```bash
# Install Ollama from https://ollama.com/
# Pull a model
ollama pull llama3.2

# Start Ollama service (if not auto-started)
ollama serve
```

### 2. Add the MCP server

```bash
claude mcp add -s project local-lm-cli -- bun run /path/to/mcp-local-lm-cli/index.ts
```

Or configure your MCP client with the settings shown in the Installation Options section below.

### 3. Try it out

Example prompts:

- **Search**: "Search for information about TypeScript 5.0 features"
- **Chat**: "Explain the difference between async/await and promises in JavaScript"
- **File Analysis**: "Analyze the image at /path/to/screenshot.png using llava model"

## 🔧 Installation Options

### Local Development

1. Clone and install:

```bash
git clone https://github.com/choplin/mcp-local-lm-cli
cd mcp-local-lm-cli
bun install
```

1. Add to Claude Desktop config:

```json
{
  "mcpServers": {
    "mcp-local-lm-cli": {
      "command": "bun",
      "args": ["run", "/path/to/mcp-local-lm-cli/index.ts"]
    }
  }
}
```

### Using npm package (when published)

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

## 🛠️ Available Tools

### 1. listModels

Discover and explore all installed Ollama models with intelligent categorization.

**Parameters:**

- `detailed` (optional): Show detailed model information including size and modification date
- `category` (optional): Filter by category: "all", "vision", "code", "general", "other"

**Features:**

- 👁️ **Vision Models**: llava, bakllava, cogvlm, moondream
- 💻 **Code Models**: codellama, deepseek-coder, starcoder, wizardcoder
- 🤖 **General Models**: llama3.x, mistral, gemma, phi, qwen
- 📦 **Other Models**: Uncategorized or specialized models

### 2. search

Provides intelligent answers to search queries using local LLMs with automatic model selection.

**Parameters:**

- `query` (required): The search query or question
- `model` (optional): Specific Ollama model to use. Auto-selects best general model if not specified
- `maxTokens` (optional): Maximum response tokens
- `temperature` (optional): Response randomness (0.0 to 2.0)

### 3. chat

Direct conversation with local LLMs with automatic model selection.

**Parameters:**

- `prompt` (required): The conversation prompt
- `model` (optional): Specific Ollama model to use. Auto-selects best general model if not specified
- `stream` (optional): Enable streaming response
- `temperature` (optional): Response randomness (0.0 to 2.0)

### 4. analyzeFile

Analyze files using local LLMs with intelligent model selection based on file type.

**Supported file types:**

- **Images**: PNG, JPG, JPEG, GIF, WEBP, BMP (automatically uses vision models)
- **Text**: TXT, MD, TEXT, JSON, JS, TS, PY, HTML, CSS (uses general models)
- **Documents**: PDF (basic support with general models)

**Parameters:**

- `filePath` (required): Absolute path to the file
- `prompt` (optional): Additional analysis instructions
- `model` (optional): Specific Ollama model to use. Auto-selects appropriate model based on file type if not specified
- `temperature` (optional): Response randomness (0.0 to 2.0)

## 💡 Example Prompts

Try these prompts to see mcp-local-lm-cli in action:

- **Model Discovery**: "List all available models" or "Show me detailed info about vision models"
- **Search**: "Search for information about the latest TypeScript features"
- **Chat**: "Explain quantum computing in simple terms using mistral model"
- **File Analysis**: "Analyze this code file: /Users/me/project/main.py"
- **Image Analysis**: "Describe what's in this image: /Users/me/Desktop/screenshot.png" (automatically uses vision model)

### 🎯 Model Selection Examples

- **Auto-selection**: `chat({ prompt: "Hello" })` - Uses best available general model
- **Specific model**: `chat({ prompt: "Hello", model: "phi3:mini" })` - Uses specified model
- **Vision tasks**: `analyzeFile({ filePath: "/path/image.png" })` - Auto-selects vision model
- **Code tasks**: `chat({ model: "codellama", prompt: "Explain this function" })` - Uses code-specific model

## 🛠️ Example Usage

### search

```typescript
// Simple search
search({ query: "What is machine learning?" });

// Search with specific model
search({
  query: "Explain Docker containers",
  model: "mistral",
  temperature: 0.3,
});
```

### chat

```typescript
// Simple chat
chat({ prompt: "Write a haiku about programming" });

// Streaming chat
chat({
  prompt: "Explain the benefits of functional programming",
  model: "codellama",
  stream: true,
});
```

### analyzeFile

```typescript
// Analyze an image
analyzeFile({ 
  filePath: "/path/to/image.png",
  prompt: "What objects are in this image?",
  model: "llava"
});

// Analyze code
analyzeFile({
  filePath: "/path/to/script.js",
  prompt: "Explain what this code does and suggest improvements"
});
```

## 📝 Development

> **Note**: Development requires [Bun](https://bun.sh) runtime.

### Run in Development Mode

```bash
bun run dev
```

### Run Tests

```bash
bun test
```

### Build for Production

```bash
# Development build
bun run build

# Production build (minified)
bun run build:prod
```

### Linting & Formatting

```bash
# Lint code
bun run lint

# Format code
bun run format
```

## 🎯 Popular Ollama Models

### General Purpose

- `llama3.2` - Great balance of performance and capability
- `llama3.1` - Larger, more capable model
- `mistral` - Fast and efficient
- `phi3` - Lightweight option

### Code-Specific

- `codellama` - Specialized for programming tasks
- `deepseek-coder` - Advanced code understanding

### Multimodal (Vision)

- `llava` - Best for image analysis
- `bakllava` - Alternative vision model

### Install models with

```bash
ollama pull <model-name>
```

## ⚡ Performance Tips

1. **Model Selection**: Use smaller models (`phi3`, `llama3.2:1b`) for faster responses
2. **Temperature**: Use lower values (0.1-0.3) for factual questions, higher (0.7-1.0) for creative tasks
3. **Streaming**: Enable streaming for long responses to improve user experience
4. **Hardware**: More RAM allows running larger models locally

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📋 Changelog

### [0.4.0] - 2025-08-06

#### Breaking Changes

- Complete rewrite to use Ollama instead of Gemini CLI
- Tool name changes: `googleSearch` → `search` (now provides knowledge-based responses)
- All parameters updated for Ollama model compatibility

#### New Features

- Local LLM support via Ollama API
- Enhanced multimodal file analysis with vision models
- Support for more text file types (.json, .js, .ts, .py, .html, .css)
- Temperature and token control parameters
- Streaming response support
- Automatic model availability checking

#### Technical Changes

- Replaced child process spawning with Ollama API calls
- Added base64 image encoding for vision models
- Enhanced error handling and connection checking
- Updated all schemas for Ollama parameters

### [0.3.1] - Previous

- Fixed Windows compatibility issue with `which` command (Gemini CLI version)

## 🔗 Related Links

- [Model Context Protocol (MCP)](https://modelcontextprotocol.io/)
- [Ollama](https://ollama.com/)
- [Ollama JavaScript Library](https://github.com/ollama/ollama-js)
- [Bun Runtime](https://bun.sh)
