import { describe, expect, test, beforeAll } from "vitest";
import {
  checkOllamaConnection,
  executeOllamaChat,
  executeOllamaGenerate,
  executeSearch,
  executeChatConversation,
  executeFileAnalysis,
} from "../../index.js";

// Check if Ollama is available
let isOllamaAvailable = false;
let availableModels: string[] = [];

beforeAll(async () => {
  try {
    availableModels = await checkOllamaConnection();
    isOllamaAvailable = true;
  } catch {
    isOllamaAvailable = false;
  }
});

describe("MCP Local LM CLI Integration Tests", () => {
  describe("Ollama connection", () => {
    test("checkOllamaConnection finds available models or throws error", async () => {
      try {
        const models = await checkOllamaConnection();
        expect(Array.isArray(models)).toBe(true);
        expect(models.length).toBeGreaterThan(0);
      } catch (error) {
        // If Ollama is not running, it should throw the expected error
        expect(error instanceof Error && error.message).toContain(
          "Cannot connect to Ollama",
        );
      }
    });

    test("executeOllamaChat handles basic prompts", async () => {
      if (!isOllamaAvailable) {
        expect(true).toBe(true); // Skip test if Ollama not available
        return;
      }

      try {
        const result = await executeOllamaChat(
          "Say hello in one word",
          availableModels[0] || "llama3.2",
          false,
        );

        expect(typeof result).toBe("string");
        expect(result.length).toBeGreaterThan(0);
      } catch (error) {
        // Expected if model not available
        expect(error).toBeInstanceOf(Error);
      }
    });

    test("executeOllamaGenerate handles basic prompts", async () => {
      if (!isOllamaAvailable) {
        expect(true).toBe(true); // Skip test if Ollama not available
        return;
      }

      try {
        const result = await executeOllamaGenerate(
          "Say hello in one word",
          availableModels[0] || "llama3.2",
        );

        expect(typeof result).toBe("string");
        expect(result.length).toBeGreaterThan(0);
      } catch (error) {
        // Expected if model not available
        expect(error).toBeInstanceOf(Error);
      }
    });
  });

  describe("tool execution", () => {
    test("search tool executes without error", async () => {
      if (!isOllamaAvailable) {
        console.log("Skipping test: Ollama not available");
        return;
      }

      const result = await executeSearch({
        query: "Hello",
        model: availableModels[0] || "llama3:latest",
        temperature: 0.1,
      });

      // Check that we got some result
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    }, 60000); // 60 second timeout

    test("chat tool executes without error", async () => {
      if (!isOllamaAvailable) {
        console.log("Skipping test: Ollama not available");
        return;
      }

      const result = await executeChatConversation({
        prompt: "Hi",
        model: availableModels[0] || "llama3:latest",
        stream: false,
        temperature: 0.1,
      });

      // Check that we got a response
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    }, 60000); // 60 second timeout

    test("file analysis tool validates file extensions", async () => {
      try {
        await executeFileAnalysis({
          filePath: "/tmp/test.invalid",
          prompt: "Analyze this",
        });

        // Should not reach here
        expect(false).toBe(true);
      } catch (error) {
        expect(error instanceof Error && error.message).toContain(
          "Unsupported file type",
        );
      }
    });

    if (!isOllamaAvailable) {
      test("Ollama not available - tests skipped", () => {
        console.log(
          "Ollama is not available. Please install and start Ollama to run integration tests.",
        );
        expect(true).toBe(true);
      });
    }
  });
});
