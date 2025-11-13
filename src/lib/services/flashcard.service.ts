import type { FlashcardCreateDto, FlashcardDto, FlashcardInsert } from "../../types";
import type { SupabaseClient } from "../../db/supabase.client";

export class FlashcardService {
  constructor(
    private supabase: SupabaseClient,
    private userId: string
  ) {}

  public async createFlashcards(flashcards: FlashcardCreateDto[]): Promise<FlashcardDto[]> {
    const flashcardsToInsert: FlashcardInsert[] = flashcards.map((flashcard) => ({
      ...flashcard,
      user_id: this.userId,
    }));

    const { data, error } = await this.supabase.from("flashcards").insert(flashcardsToInsert).select();

    if (error) {
      // TODO: Add detailed error logging
      console.error("Error inserting flashcards:", error);
      throw new Error("Failed to create flashcards in the database.");
    }

    return data;
  }
}
