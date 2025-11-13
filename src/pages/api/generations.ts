import type { APIRoute } from "astro";
import { z } from "zod";
import type { GenerateFlashcardsCommand, GenerationCreateResponseDto } from "../../types";
import { GenerationService } from "../../lib/services/generation.service";
import { DEFAULT_USER_ID } from "../../db/supabase.client";

export const prerender = false;

const generateFlashcardsSchema = z.object({
  source_text: z
    .string()
    .min(1000, "Source text must be at least 1000 characters long.")
    .max(10000, "Source text must be at most 10000 characters long."),
});

export const POST: APIRoute = async ({ request, locals }) => {
  const { supabase } = locals;
  const user = { id: DEFAULT_USER_ID }; // Using default user ID as requested

  let body: GenerateFlashcardsCommand;
  try {
    body = await request.json();
  } catch (error) {
    return new Response(JSON.stringify({ message: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const validation = generateFlashcardsSchema.safeParse(body);

  if (!validation.success) {
    return new Response(JSON.stringify({ message: "Validation failed", errors: validation.error.flatten() }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const generationService = new GenerationService(supabase, user.id);

  try {
    const result = await generationService.generateFlashcards(validation.data);

    const response: GenerationCreateResponseDto = {
      generation_id: result.generationId,
      flashcard_proposals: result.flashcardProposals,
      generated_count: result.generatedCount,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // TODO: Add detailed error logging (e.g., to generation_error_logs)
    console.error("Error during flashcard generation:", error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
