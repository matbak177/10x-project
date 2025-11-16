import type { ChatCompletionOptions, ChatCompletionResponse } from "@/types";

// Definicje niestandardowych błędów
export class OpenRouterServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}
export class ConfigurationError extends OpenRouterServiceError {}
export class ApiError extends OpenRouterServiceError {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.status = status;
  }
}
export class NetworkError extends OpenRouterServiceError {}
export class ResponseParseError extends OpenRouterServiceError {}

export class OpenRouterService {
  private static instance: OpenRouterService;
  private readonly apiKey: string;
  private readonly apiUrl = "https://openrouter.ai/api/v1/chat/completions";

  private constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  public static getInstance(): OpenRouterService {
    if (!OpenRouterService.instance) {
      const apiKey = import.meta.env.OPENROUTER_API_KEY;
      if (!apiKey) {
        throw new ConfigurationError("Zmienna środowiskowa OPENROUTER_API_KEY nie jest ustawiona.");
      }
      OpenRouterService.instance = new OpenRouterService(apiKey);
    }
    return OpenRouterService.instance;
  }

  public async getChatCompletion(options: ChatCompletionOptions): Promise<ChatCompletionResponse> {
    const payload = this._buildPayload(options);

    try {
      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": import.meta.env.SITE_URL || "http://localhost:4321", // Zastąp lub skonfiguruj
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        const errorMessage = errorBody?.error?.message || `Błąd API: ${response.statusText}`;
        throw new ApiError(errorMessage, response.status);
      }

      const responseData = await response.json();
      const rawContent = responseData.choices[0]?.message?.content || "";

      if (options.responseSchema) {
        try {
          // In tool_use mode, the response is a JSON string inside `tool_calls`.
          const toolCallContent = responseData.choices[0]?.message?.tool_calls?.[0]?.function?.arguments;
          if (toolCallContent) {
            const structuredContent = JSON.parse(toolCallContent);
            return { rawContent: toolCallContent, structuredContent };
          }

          // Fallback for regular JSON response
          const structuredContent = JSON.parse(rawContent);
          return { rawContent, structuredContent };
        } catch {
          throw new ResponseParseError("Nie udało się sparsować odpowiedzi JSON od modelu.");
        }
      }

      return { rawContent };
    } catch (error) {
      if (error instanceof ApiError || error instanceof ResponseParseError) {
        throw error;
      }
      // Zakładamy, że inne błędy to problemy sieciowe
      throw new NetworkError(`Błąd sieci podczas komunikacji z OpenRouter API: ${(error as Error).message}`);
    }
  }

  private _buildPayload(options: ChatCompletionOptions): object {
    const messages: { role: string; content: string }[] = [];

    if (options.systemMessage) {
      messages.push({ role: "system", content: options.systemMessage });
    }
    messages.push({ role: "user", content: options.userMessage });

    const payload: Record<string, unknown> = {
      model: options.model || "openai/gpt-3.5-turbo", // Model domyślny
      messages,
      ...options.params,
    };

    if (options.responseSchema) {
      payload.tool_choice = "auto";
      payload.tools = [
        {
          type: "function",
          function: {
            name: options.responseSchema.name,
            description: "Extract information based on the provided JSON schema.",
            parameters: options.responseSchema.schema,
          },
        },
      ];
    }

    return payload;
  }
}
