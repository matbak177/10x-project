import type {
  FlashcardCreateDto,
  FlashcardDto,
  FlashcardInsert,
  FlashcardListResponseDto,
  PaginationDto,
  FlashcardUpdateDto,
} from "../../types";
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

  public async getFlashcards(options: {
    page: number;
    limit: number;
    sort: "created_at" | "updated_at" | "front";
    order: "asc" | "desc";
  }): Promise<FlashcardListResponseDto> {
    const { page, limit, sort, order } = options;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: flashcards, error } = await this.supabase
      .from("flashcards")
      .select("*")
      .eq("user_id", this.userId)
      .order(sort, { ascending: order === "asc" })
      .range(from, to);

    if (error) {
      console.error("Error fetching flashcards:", error);
      throw new Error("Failed to fetch flashcards from the database.");
    }

    const { count, error: countError } = await this.supabase
      .from("flashcards")
      .select("id", { count: "exact" })
      .eq("user_id", this.userId);

    if (countError) {
      console.error("Error fetching flashcards count:", countError);
      throw new Error("Failed to fetch flashcards count from the database.");
    }

    const pagination: PaginationDto = {
      page,
      limit,
      total: count ?? 0,
    };

    return {
      data: flashcards as FlashcardDto[],
      pagination,
    };
  }

  public async updateFlashcard(id: number, flashcardUpdateDto: FlashcardUpdateDto): Promise<void> {
    const { error, count } = await this.supabase
      .from("flashcards")
      .update(flashcardUpdateDto)
      .match({ id: id, user_id: this.userId });

    if (error) {
      console.error("Error updating flashcard:", error);
      throw new Error("Failed to update flashcard in the database.");
    }

    if (count === 0) {
      throw new Error("Flashcard not found or user does not have permission to update it."); // Will be caught and handled as 404
    }
  }

  public async deleteFlashcard(id: number): Promise<void> {
    const { error, count } = await this.supabase.from("flashcards").delete().match({ id: id, user_id: this.userId });

    if (error) {
      console.error("Error deleting flashcard:", error);
      throw new Error("Failed to delete flashcard from the database.");
    }

    if (count === 0) {
      throw new Error("Flashcard not found or user does not have permission to delete it."); // Will be caught and handled as 404
    }
  }
}
