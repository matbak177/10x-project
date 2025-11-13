import type { APIRoute } from "astro";
import { z } from "zod";
import type { FlashcardsCreateCommand } from "../../types";
import { DEFAULT_USER_ID } from "../../db/supabase.client";
import { FlashcardService } from "../../lib/services/flashcard.service";

export const prerender = false;

const flashcardCreateDtoSchema = z
  .object({
    front: z.string().min(1, "Front cannot be empty.").max(200, "Front is too long."),
    back: z.string().min(1, "Back cannot be empty.").max(500, "Back is too long."),
    source: z.enum(["manual", "ai-full", "ai-edited"]),
    generation_id: z.number().int().positive().nullable(),
  })
  .refine(
    (data) => {
      if (data.source === "manual") {
        return data.generation_id === null;
      }
      if (data.source === "ai-full" || data.source === "ai-edited") {
        return typeof data.generation_id === "number";
      }
      return true;
    },
    {
      message: "generation_id must be null for 'manual' source, and a number for 'ai-full' or 'ai-edited' sources.",
      path: ["generation_id"],
    }
  );

const flashcardsCreateCommandSchema = z.object({
  flashcards: z.array(flashcardCreateDtoSchema).min(1, "At least one flashcard is required."),
});

export const POST: APIRoute = async ({ request, locals }) => {
  const { supabase } = locals;
  const user = { id: DEFAULT_USER_ID }; // Using default user ID as requested in other endpoints

  let body: FlashcardsCreateCommand;
  try {
    body = await request.json();
  } catch (error) {
    return new Response(JSON.stringify({ message: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const validation = flashcardsCreateCommandSchema.safeParse(body);

  if (!validation.success) {
    return new Response(JSON.stringify({ message: "Validation failed", errors: validation.error.flatten() }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const flashcardService = new FlashcardService(supabase, user.id);

  try {
    const createdFlashcards = await flashcardService.createFlashcards(validation.data.flashcards);
    return new Response(JSON.stringify(createdFlashcards), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating flashcards:", error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
