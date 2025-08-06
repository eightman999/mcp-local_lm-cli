import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Ollama } from "ollama";
import { z } from "zod";
import { extname } from "node:path";
import { readFile } from "node:fs/promises";

// Initialize Ollama client
const ollama = new Ollama({
  host: "http://localhost:11434",
});

// Interface for model information
export interface ModelInfo {
  name: string;
  size: number;
  modified_at: string;
  details: {
    family?: string;
    parameter_size?: string;
    quantization_level?: string;
  };
}

// Interface for categorized models
export interface CategorizedModels {
  vision: string[];
  code: string[];
  general: string[];
  other: string[];
}

// Function to check if Ollama is available and list models
export async function checkOllamaConnection(): Promise<string[]> {
  try {
    const models = await ollama.list();
    return models.models.map((model) => model.name);
  } catch (error) {
    throw new Error(
      `Cannot connect to Ollama. Please ensure Ollama is running on http://localhost:11434. Error: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

// Function to get detailed model information
export async function getModelDetails(): Promise<ModelInfo[]> {
  try {
    const models = await ollama.list();
    return models.models.map((model) => ({
      name: model.name,
      size: model.size,
      modified_at: model.modified_at.toString(),
      details: model.details || {},
    }));
  } catch (error) {
    throw new Error(
      `Failed to get model details: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

// Function to categorize models by their capabilities
export function categorizeModels(modelNames: string[]): CategorizedModels {
  const categorized: CategorizedModels = {
    vision: [],
    code: [],
    general: [],
    other: [],
  };

  for (const modelName of modelNames) {
    const name = modelName.toLowerCase();

    // Vision models
    if (
      name.includes("llava") ||
      name.includes("vision") ||
      name.includes("bakllava") ||
      name.includes("cogvlm") ||
      name.includes("moondream")
    ) {
      categorized.vision.push(modelName);
    }
    // Code models
    else if (
      name.includes("code") ||
      name.includes("coder") ||
      name.includes("deepseek-coder") ||
      name.includes("starcoder") ||
      name.includes("wizardcoder") ||
      name.includes("phind-codellama")
    ) {
      categorized.code.push(modelName);
    }
    // General models
    else if (
      name.includes("llama") ||
      name.includes("mistral") ||
      name.includes("gemma") ||
      name.includes("phi") ||
      name.includes("qwen") ||
      name.includes("openchat") ||
      name.includes("vicuna") ||
      name.includes("alpaca") ||
      name.includes("orca")
    ) {
      categorized.general.push(modelName);
    }
    // Other models
    else {
      categorized.other.push(modelName);
    }
  }

  return categorized;
}

// Function to validate if a model exists
export async function validateModel(modelName: string): Promise<boolean> {
  try {
    const availableModels = await checkOllamaConnection();
    return availableModels.includes(modelName);
  } catch (_error) {
    return false;
  }
}

// Function to get best model for a specific task
export async function getBestModelForTask(
  task: "vision" | "code" | "general",
): Promise<string | null> {
  try {
    const availableModels = await checkOllamaConnection();
    const categorized = categorizeModels(availableModels);

    const taskModels = categorized[task];
    if (taskModels.length > 0) {
      return taskModels[0] || null; // Return the first available model for the task
    }

    // Fallback to general models if specific task models not available
    if (task !== "general" && categorized.general.length > 0) {
      return categorized.general[0] || null;
    }

    // Final fallback to any available model
    return availableModels.length > 0 ? availableModels[0] || null : null;
  } catch (_error) {
    return null;
  }
}

// Function to execute Ollama chat
export async function executeOllamaChat(
  prompt: string,
  model = "llama3.2",
  stream = false,
): Promise<string> {
  try {
    if (stream) {
      const response = await ollama.chat({
        model,
        messages: [{ role: "user", content: prompt }],
        stream: true,
      });

      // Handle streaming response
      let fullResponse = "";
      for await (const part of response) {
        if (part.message?.content) {
          fullResponse += part.message.content;
        }
      }
      return fullResponse;
    } else {
      const response = await ollama.chat({
        model,
        messages: [{ role: "user", content: prompt }],
        stream: false,
      });
      return response.message.content;
    }
  } catch (error) {
    throw new Error(
      `Ollama chat failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

// Function to execute Ollama generate (for simpler prompts)
export async function executeOllamaGenerate(
  prompt: string,
  model = "llama3.2",
): Promise<string> {
  try {
    const response = await ollama.generate({
      model,
      prompt,
      stream: false,
    });
    return response.response;
  } catch (error) {
    throw new Error(
      `Ollama generate failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

// Zod schema for search tool parameters
export const SearchParametersSchema = z.object({
  query: z.string().describe("The search query or question to ask the LLM."),
  model: z
    .string()
    .optional()
    .describe(
      "The Ollama model to use. Use 'listModels' tool to see available models. Will auto-select appropriate model if not specified.",
    ),
  maxTokens: z
    .number()
    .optional()
    .describe("Maximum number of tokens in the response (optional)."),
  temperature: z
    .number()
    .min(0)
    .max(2)
    .optional()
    .describe("Temperature for response randomness (0.0 to 2.0, optional)."),
});

// Zod schema for chat tool parameters
export const ChatParametersSchema = z.object({
  prompt: z.string().describe("The prompt for the chat conversation."),
  model: z
    .string()
    .optional()
    .describe(
      "The Ollama model to use. Use 'listModels' tool to see available models. Will auto-select appropriate model if not specified.",
    ),
  stream: z
    .boolean()
    .optional()
    .describe("Enable streaming response (optional)."),
  temperature: z
    .number()
    .min(0)
    .max(2)
    .optional()
    .describe("Temperature for response randomness (0.0 to 2.0, optional)."),
});

// Zod schema for analyzeFile tool parameters
export const AnalyzeFileParametersSchema = z.object({
  filePath: z.string().describe("The absolute path to the file to analyze."),
  prompt: z
    .string()
    .optional()
    .describe(
      "Additional instructions for analyzing the file. If not provided, the LLM will provide a general analysis.",
    ),
  model: z
    .string()
    .optional()
    .describe(
      "The Ollama model to use. For images, vision models (e.g., llava) are recommended. Use 'listModels' tool to see available models. Will auto-select appropriate model based on file type if not specified.",
    ),
  temperature: z
    .number()
    .min(0)
    .max(2)
    .optional()
    .describe("Temperature for response randomness (0.0 to 2.0, optional)."),
});

// Supported file extensions for analyzeFile
const SUPPORTED_IMAGE_EXTENSIONS = [
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".bmp",
];
const SUPPORTED_TEXT_EXTENSIONS = [
  ".txt",
  ".md",
  ".text",
  ".json",
  ".js",
  ".ts",
  ".py",
  ".html",
  ".css",
];
const SUPPORTED_DOCUMENT_EXTENSIONS = [".pdf"];
const SUPPORTED_EXTENSIONS = [
  ...SUPPORTED_IMAGE_EXTENSIONS,
  ...SUPPORTED_TEXT_EXTENSIONS,
  ...SUPPORTED_DOCUMENT_EXTENSIONS,
];

// Tool execution functions
export async function executeSearch(args: unknown) {
  const parsedArgs = SearchParametersSchema.parse(args);

  // Determine the best model
  let model = parsedArgs.model;
  if (!model) {
    model = (await getBestModelForTask("general")) || "llama3.2";
  } else {
    // Validate the specified model
    const isValid = await validateModel(model);
    if (!isValid) {
      throw new Error(
        `Model '${model}' is not available. Use 'listModels' tool to see available models.`,
      );
    }
  }

  // Enhanced search prompt
  const searchPrompt = `Please provide a comprehensive answer to this query: "${parsedArgs.query}"

If this appears to be a search query that would benefit from current information, please:
1. Provide the best answer based on your knowledge
2. Note any limitations regarding real-time information
3. Suggest ways the user might find more current information if needed

Please be thorough and informative in your response.`;

  return await executeOllamaGenerate(searchPrompt, model);
}

export async function executeChatConversation(args: unknown) {
  const parsedArgs = ChatParametersSchema.parse(args);

  // Determine the best model
  let model = parsedArgs.model;
  if (!model) {
    model = (await getBestModelForTask("general")) || "llama3.2";
  } else {
    // Validate the specified model
    const isValid = await validateModel(model);
    if (!isValid) {
      throw new Error(
        `Model '${model}' is not available. Use 'listModels' tool to see available models.`,
      );
    }
  }

  const stream = parsedArgs.stream || false;

  return await executeOllamaChat(parsedArgs.prompt, model, stream);
}

export async function executeFileAnalysis(args: unknown) {
  const parsedArgs = AnalyzeFileParametersSchema.parse(args);

  // Check if file extension is supported
  const fileExtension = extname(parsedArgs.filePath).toLowerCase();
  if (!SUPPORTED_EXTENSIONS.includes(fileExtension)) {
    throw new Error(
      `Unsupported file type: ${fileExtension}. Supported types are:\n` +
        `Images: ${SUPPORTED_IMAGE_EXTENSIONS.join(", ")}\n` +
        `Text: ${SUPPORTED_TEXT_EXTENSIONS.join(", ")}\n` +
        `Documents: ${SUPPORTED_DOCUMENT_EXTENSIONS.join(", ")}`,
    );
  }

  // Determine the best model based on file type
  let model = parsedArgs.model;
  if (!model) {
    if (SUPPORTED_IMAGE_EXTENSIONS.includes(fileExtension)) {
      model = (await getBestModelForTask("vision")) || "llava";
    } else {
      model = (await getBestModelForTask("general")) || "llama3.2";
    }
  } else {
    // Validate the specified model
    const isValid = await validateModel(model);
    if (!isValid) {
      throw new Error(
        `Model '${model}' is not available. Use 'listModels' tool to see available models.`,
      );
    }
  }

  // For image files, use vision model
  if (SUPPORTED_IMAGE_EXTENSIONS.includes(fileExtension)) {
    const imageBuffer = await readFile(parsedArgs.filePath);
    const base64Image = imageBuffer.toString("base64");

    let visionPrompt = "Analyze this image and describe what you see.";
    if (parsedArgs.prompt) {
      visionPrompt = `${parsedArgs.prompt}\n\nImage analysis:`;
    }

    const response = await ollama.chat({
      model,
      messages: [
        {
          role: "user",
          content: visionPrompt,
          images: [base64Image],
        },
      ],
      stream: false,
    });

    return response.message.content;
  }

  // For text files, read content and analyze
  if (SUPPORTED_TEXT_EXTENSIONS.includes(fileExtension)) {
    const fileContent = await readFile(parsedArgs.filePath, "utf-8");

    let analysisPrompt = `Analyze this file content:\n\n${fileContent}`;
    if (parsedArgs.prompt) {
      analysisPrompt = `${parsedArgs.prompt}\n\nFile content to analyze:\n\n${fileContent}`;
    }

    return await executeOllamaGenerate(
      analysisPrompt,
      parsedArgs.model || "llama3.2",
    );
  }

  // For PDF files (note: this is a simplified approach)
  if (fileExtension === ".pdf") {
    const analysisPrompt =
      parsedArgs.prompt ||
      "This is a PDF file. For comprehensive PDF analysis, you would need additional PDF processing tools. Please describe what kind of analysis you need.";

    return await executeOllamaGenerate(
      `PDF file analysis requested for: ${parsedArgs.filePath}\n\n${analysisPrompt}`,
      parsedArgs.model || "llama3.2",
    );
  }

  throw new Error(
    `Unsupported file processing for extension: ${fileExtension}`,
  );
}

async function main() {
  // Check if Ollama is available at startup
  try {
    const availableModels = await checkOllamaConnection();
    console.error(
      `Connected to Ollama. Available models: ${availableModels.join(", ")}`,
    );
  } catch (error) {
    console.error(
      `Error: ${error instanceof Error ? error.message : String(error)}`,
    );
    console.error(
      "Please start Ollama service (ollama serve) and ensure models are installed (e.g., ollama pull llama3.2).",
    );
    process.exit(1);
  }

  const server = new McpServer({
    name: "mcp-local-lm-cli",
    version: "0.4.0",
  });

  // Register listModels tool
  server.registerTool(
    "listModels",
    {
      description:
        "Lists all available Ollama models with their details and categorizes them by capability (vision, code, general).",
      inputSchema: {
        detailed: z
          .boolean()
          .optional()
          .describe(
            "Include detailed model information (size, modification date, etc.)",
          ),
        category: z
          .enum(["all", "vision", "code", "general", "other"])
          .optional()
          .describe("Filter models by category"),
      },
    },
    async (args) => {
      try {
        const parsedArgs = z
          .object({
            detailed: z.boolean().optional(),
            category: z
              .enum(["all", "vision", "code", "general", "other"])
              .optional(),
          })
          .parse(args);

        const availableModels = await checkOllamaConnection();
        const categorizedModels = categorizeModels(availableModels);

        let result: string;

        if (parsedArgs.detailed) {
          const modelDetails = await getModelDetails();
          result = "📋 **Available Ollama Models (Detailed)**\n\n";

          const formatSize = (bytes: number) => {
            const gb = bytes / (1024 * 1024 * 1024);
            return `${gb.toFixed(2)} GB`;
          };

          for (const model of modelDetails) {
            const category =
              Object.entries(categorizedModels).find(([_, models]) =>
                models.includes(model.name),
              )?.[0] || "other";

            result += `🔸 **${model.name}**\n`;
            result += `   Category: ${category}\n`;
            result += `   Size: ${formatSize(model.size)}\n`;
            result += `   Modified: ${new Date(model.modified_at).toLocaleDateString()}\n`;
            if (model.details.family)
              result += `   Family: ${model.details.family}\n`;
            if (model.details.parameter_size)
              result += `   Parameters: ${model.details.parameter_size}\n`;
            result += "\n";
          }
        } else {
          result = "📋 **Available Ollama Models by Category**\n\n";

          const categoriesToShow =
            parsedArgs.category && parsedArgs.category !== "all"
              ? [parsedArgs.category]
              : (Object.keys(categorizedModels) as (keyof CategorizedModels)[]);

          for (const category of categoriesToShow) {
            const models = categorizedModels[category];
            if (models.length > 0) {
              const emoji = {
                vision: "👁️",
                code: "💻",
                general: "🤖",
                other: "📦",
              }[category];

              result += `${emoji} **${category.charAt(0).toUpperCase() + category.slice(1)} Models:**\n`;
              for (const model of models) {
                result += `  • ${model}\n`;
              }
              result += "\n";
            }
          }

          result += `\n**Total Models:** ${availableModels.length}\n\n`;
          result += "💡 **Usage Tips:**\n";
          result += "- Use vision models (👁️) for image analysis\n";
          result += "- Use code models (💻) for programming tasks\n";
          result +=
            "- Use general models (🤖) for general conversation and text analysis\n";
          result +=
            "- You can specify any model name in the 'model' parameter of other tools\n";
        }

        return {
          content: [
            {
              type: "text",
              text: result,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error listing models: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    },
  );

  // Register search tool (replaces googleSearch)
  server.registerTool(
    "search",
    {
      description:
        "Performs intelligent search and provides comprehensive answers using local LLM via Ollama.",
      inputSchema: {
        query: z
          .string()
          .describe("The search query or question to ask the LLM."),
        model: z
          .string()
          .optional()
          .describe(
            "The Ollama model to use. Use 'listModels' tool to see available models. Will auto-select appropriate model if not specified.",
          ),
        maxTokens: z
          .number()
          .optional()
          .describe("Maximum number of tokens in the response (optional)."),
        temperature: z
          .number()
          .min(0)
          .max(2)
          .optional()
          .describe(
            "Temperature for response randomness (0.0 to 2.0, optional).",
          ),
      },
    },
    async (args) => {
      const result = await executeSearch(args);
      return {
        content: [
          {
            type: "text",
            text: result,
          },
        ],
      };
    },
  );

  // Register chat tool
  server.registerTool(
    "chat",
    {
      description: "Engages in a chat conversation with local LLM via Ollama.",
      inputSchema: {
        prompt: z.string().describe("The prompt for the chat conversation."),
        model: z
          .string()
          .optional()
          .describe(
            "The Ollama model to use. Use 'listModels' tool to see available models. Will auto-select appropriate model if not specified.",
          ),
        stream: z
          .boolean()
          .optional()
          .describe("Enable streaming response (optional)."),
        temperature: z
          .number()
          .min(0)
          .max(2)
          .optional()
          .describe(
            "Temperature for response randomness (0.0 to 2.0, optional).",
          ),
      },
    },
    async (args) => {
      const result = await executeChatConversation(args);
      return {
        content: [
          {
            type: "text",
            text: result,
          },
        ],
      };
    },
  );

  // Register analyzeFile tool
  server.registerTool(
    "analyzeFile",
    {
      description:
        "Analyzes files using local LLM via Ollama. Supports images (with vision models like llava), text files, and basic document analysis.",
      inputSchema: {
        filePath: z
          .string()
          .describe(
            "The absolute path to the file to analyze. Supported: images (.png, .jpg, .jpeg, .gif, .webp, .bmp), text files (.txt, .md, .text, .json, .js, .ts, .py, .html, .css), PDFs (.pdf)",
          ),
        prompt: z
          .string()
          .optional()
          .describe(
            "Additional instructions for analyzing the file. If not provided, the LLM will provide a general analysis.",
          ),
        model: z
          .string()
          .optional()
          .describe(
            "The Ollama model to use. For images, vision models (e.g., llava) are recommended. Use 'listModels' tool to see available models. Will auto-select appropriate model based on file type if not specified.",
          ),
        temperature: z
          .number()
          .min(0)
          .max(2)
          .optional()
          .describe(
            "Temperature for response randomness (0.0 to 2.0, optional).",
          ),
      },
    },
    async (args) => {
      const result = await executeFileAnalysis(args);
      return {
        content: [
          {
            type: "text",
            text: result,
          },
        ],
      };
    },
  );

  // Connect the server to stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

// Only run main if this file is being executed directly
if (import.meta.main) {
  main().catch(console.error);
}
