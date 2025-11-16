import type { APIRoute } from "astro";
import { z } from "zod";
import { FlashcardService } from "../../../lib/services/flashcard.service";
import type { FlashcardUpdateDto } from "../../../types";

export const prerender = false;

const flashcardUpdateSchema = z.object({
  front: z.string().min(1, "Front cannot be empty.").max(200, "Front is too long.").optional(),
  back: z.string().min(1, "Back cannot be empty.").max(500, "Back is too long.").optional(),
  source: z.enum(["ai-edited", "manual"]).optional(),
  generation_id: z.number().int().positive().nullable().optional(),
});

export const PUT: APIRoute = async ({ params, request, locals }) => {
  const { supabase } = locals;
  const { data: userData, error: userError } = await locals.supabase.auth.getUser();

  if (userError || !userData?.user) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const user = userData.user;

  const flashcardId = Number(params.id);
  if (isNaN(flashcardId) || flashcardId <= 0) {
    return new Response(JSON.stringify({ message: "Invalid flashcard ID" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: FlashcardUpdateDto;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ message: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const validation = flashcardUpdateSchema.safeParse(body);
  if (!validation.success) {
    return new Response(JSON.stringify({ message: "Validation failed", errors: validation.error.flatten() }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const flashcardService = new FlashcardService(supabase, user.id);

  try {
    await flashcardService.updateFlashcard(flashcardId, validation.data);
    return new Response(null, { status: 204 });
  } catch (error) {
    if (error instanceof Error && error.message.includes("not found")) {
      return new Response(JSON.stringify({ message: error.message }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    // eslint-disable-next-line no-console
    console.error("Error updating flashcard:", error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  const { supabase } = locals;
  const { data: userData, error: userError } = await locals.supabase.auth.getUser();

  if (userError || !userData?.user) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const user = userData.user;

  const flashcardId = Number(params.id);
  if (isNaN(flashcardId) || flashcardId <= 0) {
    return new Response(JSON.stringify({ message: "Invalid flashcard ID" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const flashcardService = new FlashcardService(supabase, user.id);

  try {
    await flashcardService.deleteFlashcard(flashcardId);
    return new Response(null, { status: 204 });
  } catch (error) {
    if (error instanceof Error && error.message.includes("not found")) {
      return new Response(JSON.stringify({ message: error.message }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    // eslint-disable-next-line no-console
    console.error("Error deleting flashcard:", error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
