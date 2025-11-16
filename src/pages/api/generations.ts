import type { APIRoute } from "astro";
import { z } from "zod";
import type { GenerateFlashcardsCommand, GenerationCreateResponseDto } from "../../types";
import { GenerationService } from "../../lib/services/generation.service";

export const prerender = false;

const generateFlashcardsSchema = z.object({
  source_text: z
    .string()
    .min(1000, "Source text must be at least 1000 characters long.")
    .max(10000, "Source text must be at most 10000 characters long."),
});

export const POST: APIRoute = async ({ request, locals }) => {
  const { supabase } = locals;
  const { data: userData, error: userError } = await locals.supabase.auth.getUser();

  if (userError || !userData?.user) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const user = userData.user;

  let body: GenerateFlashcardsCommand;
  try {
    body = await request.json();
  } catch {
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
    // eslint-disable-next-line no-console
    console.error("Error during flashcard generation:", error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
