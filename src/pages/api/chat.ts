import type { APIRoute } from "astro";
import { OpenRouterService, ApiError, OpenRouterServiceError } from "@/lib/openrouter.service";
import { z } from "zod";
import type { ChatCompletionOptions } from "@/types";

const ChatRequestSchema = z.object({
  userMessage: z.string().min(1, "Wiadomość nie może być pusta."),
  systemMessage: z.string().optional(),
  model: z.string().optional(),
  responseSchema: z
    .object({
      name: z.string(),
      schema: z.object({}).passthrough(),
    })
    .optional(),
  params: z
    .object({
      temperature: z.number().min(0).max(2).optional(),
      top_p: z.number().min(0).max(1).optional(),
      frequency_penalty: z.number().min(-2).max(2).optional(),
      presence_penalty: z.number().min(-2).max(2).optional(),
    })
    .optional(),
});

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();

    const validationResult = ChatRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ error: "Nieprawidłowe dane wejściowe.", details: validationResult.error.flatten() }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const service = OpenRouterService.getInstance();
    const response = await service.getChatCompletion(validationResult.data as ChatCompletionOptions);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error); // Logowanie błędu po stronie serwera

    if (error instanceof ApiError) {
      return new Response(JSON.stringify({ error: error.message }), { status: error.status });
    }
    if (error instanceof OpenRouterServiceError) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    }

    return new Response(JSON.stringify({ error: "Wystąpił wewnętrzny błąd serwera" }), { status: 500 });
  }
};
