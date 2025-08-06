# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an MCP (Model Context Protocol) server wrapper for local LLMs via Ollama. The server exposes three main tools through the MCP protocol:

- `search`: Provides intelligent answers using local LLMs (knowledge-based responses instead of web search)
- `chat`: Direct conversation with local LLMs via Ollama
- `analyzeFile`: Multimodal file analysis (images with vision models, text files, basic PDF support)

The project is built with TypeScript, uses Bun as the runtime, and follows a single-file architecture pattern in `index.ts`.

## Development Commands

**Development workflow:**

```bash
# Start development server with hot reload
bun run dev

# Run tests
bun test

# Run integration tests specifically
bun test tests/integration

# Build for development (with sourcemaps)
bun run build

# Build for production (minified, no sourcemaps)
bun run build:prod
```

**Code quality:**

```bash
# Lint TypeScript code
bun run lint

# Fix linting issues automatically
bun run lint:fix

# Format code with Biome
bun run format

# Lint markdown files
bun run lint:md

# Fix markdown linting issues
bun run lint:md:fix
```

## Architecture

**Core Components:**

- `checkOllamaConnection()`: Verifies Ollama connection and lists available models
- `executeOllamaChat()`: Handles chat-based interactions with streaming support
- `executeOllamaGenerate()`: Handles simple prompt-response interactions
- Three main tool executors: `executeSearch()`, `executeChatConversation()`, `executeFileAnalysis()`
- Zod schemas for parameter validation: `SearchParametersSchema`, `ChatParametersSchema`, `AnalyzeFileParametersSchema`

**Key Features:**

- Local LLM integration via Ollama API (<http://localhost:11434>)
- Multimodal support with vision models (llava) for image analysis
- Base64 image encoding for vision model integration
- Streaming response support for better UX
- Enhanced file type support for text files (.json, .js, .ts, .py, .html, .css)
- Temperature and token control parameters
- MCP protocol integration using `@modelcontextprotocol/sdk`

**Tool Parameters:**
All tools support common parameters: `model`, `temperature` (0.0-2.0)

- `search`: `query`, `maxTokens` (provides knowledge-based responses)
- `chat`: `prompt`, `stream` (boolean for streaming responses)
- `analyzeFile`: `filePath`, `prompt` (optional analysis instructions, defaults to llava for images)

## Prerequisites

- **Ollama**: Must be installed and running (ollama serve)
- **Models**: At least one model must be pulled (e.g., `ollama pull llama3.2`)
- **Vision Models**: For image analysis, pull a vision model (`ollama pull llava`)

## Testing

The project uses Bun's built-in test runner. Integration tests are located in `tests/integration/tools.test.ts` and test the core tool execution functions with mocked Ollama API responses.

## Dependencies

- **Runtime**: Bun (required for development)
- **Core**: `@modelcontextprotocol/sdk` for MCP protocol, `ollama` for local LLM integration, `zod` for validation
- **Dev Tools**: Biome for linting/formatting, TypeScript for types, lefthook for git hooks

## Build Output

The build process creates executable files in `dist/` with a shebang for CLI usage. The main entry point becomes `dist/index.js` which can be run as a standalone executable.

## Popular Ollama Models

- **General**: `llama3.2`, `llama3.1`, `mistral`, `phi3`
- **Code**: `codellama`, `deepseek-coder`  
- **Vision**: `llava`, `bakllava`
- Install with: `ollama pull <model-name>`
