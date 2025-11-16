import type { SupabaseClient } from "@/db/supabase.client";
import type { Database } from "@/db/database.types";
import { ApiService } from "./api.service";

type Flashcard = Database["public"]["Tables"]["flashcards"]["Row"];
type FlashcardCreateDto = Omit<Flashcard, "id" | "created_at" | "updated_at" | "user_id">;
type FlashcardUpdateDto = Partial<FlashcardCreateDto>;

interface GetFlashcardsQuery {
  page: number;
  limit: number;
  sort: "created_at" | "updated_at" | "front";
  order: "asc" | "desc";
}

interface GetFlashcardsResult {
  data: Flashcard[];
  count: number;
  page: number;
  limit: number;
}

export class FlashcardService extends ApiService {
  private readonly userId: string;

  constructor(supabase: SupabaseClient, userId: string) {
    super(supabase);
    this.userId = userId;
  }

  async getFlashcards(query: GetFlashcardsQuery): Promise<GetFlashcardsResult> {
    const { page, limit, sort, order } = query;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await this.supabase
      .from("flashcards")
      .select("*", { count: "exact" })
      .eq("user_id", this.userId)
      .order(sort, { ascending: order === "asc" })
      .range(from, to);

    if (error) {
      throw new Error(`Error fetching flashcards: ${error.message}`);
    }

    return {
      data: data || [],
      count: count || 0,
      page,
      limit,
    };
  }

  async createFlashcards(flashcards: FlashcardCreateDto[]): Promise<Flashcard[]> {
    const flashcardsToInsert = flashcards.map((f) => ({ ...f, user_id: this.userId }));

    const { data, error } = await this.supabase.from("flashcards").insert(flashcardsToInsert).select();

    if (error) {
      throw new Error(`Error creating flashcards: ${error.message}`);
    }

    return data;
  }

  async updateFlashcard(id: number, flashcard: FlashcardUpdateDto): Promise<Flashcard> {
    const { data, error } = await this.supabase
      .from("flashcards")
      .update({ ...flashcard, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", this.userId)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        throw new Error(`Flashcard with id ${id} not found.`);
      }
      throw new Error(`Error updating flashcard: ${error.message}`);
    }
    if (!data) {
      throw new Error(`Flashcard with id ${id} not found.`);
    }

    return data;
  }

  async deleteFlashcard(id: number): Promise<void> {
    const { error } = await this.supabase.from("flashcards").delete().eq("id", id).eq("user_id", this.userId);

    if (error) {
      throw new Error(`Error deleting flashcard: ${error.message}`);
    }
  }
}
