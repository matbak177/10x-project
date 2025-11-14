// src/types.ts
import type { Database } from "./db/database.types";

export type Flashcard = Database["public"]["Tables"]["flashcards"]["Row"];
export type FlashcardInsert = Database["public"]["Tables"]["flashcards"]["Insert"];
export type Generation = Database["public"]["Tables"]["generations"]["Row"];
export type GenerationErrorLog = Database["public"]["Tables"]["generation_error_logs"]["Row"];

// --- Flashcard DTO ---

export type FlashcardDto = Pick<
  Flashcard,
  "id" | "front" | "back" | "source" | "generation_id" | "created_at" | "updated_at"
>;

export interface PaginationDto {
  page: number;

  limit: number;
  total: number;
}

export interface FlashcardListResponseDto {
  data: FlashcardDto[];
  pagination: PaginationDto;
}

export type Source = "ai-full" | "ai-edited" | "manual";

export interface FlashcardCreateDto {
  front: string;
  back: string;
  source: Source;
  generation_id: number | null;
}

export interface FlashcardsCreateCommand {
  flashcards: FlashcardCreateDto[];
}

export type FlashcardUpdateDto = Partial<{
  front: string;
  back: string;
  source: Source;
  generation_id: number | null;
}>;

export interface GenerateFlashcardsCommand {
  source_text: string;
}

export interface FlashcardProposalDto {
  front: string;
  back: string;
  source: "ai-full";
}

export interface GenerationCreateResponseDto {
  generation_id: number;
  flashcard_proposals: FlashcardProposalDto[];
  generated_count: number;
}

export type GenerationDetailDto = Generation & {
  flashcards?: FlashcardDto[];
};

export type GenerationErrorLogDto = Pick<
  GenerationErrorLog,
  "id" | "error_code" | "error_message" | "model" | "source_text_hash" | "source_text_length" | "created_at" | "user_id"
>;

// --- OpenRouter Service Types ---

export interface ChatCompletionOptions {
  model?: string;
  userMessage: string;
  systemMessage?: string;
  responseSchema?: {
    name: string;
    schema: object;
  };
  params?: {
    temperature?: number;
    top_p?: number;
    frequency_penalty?: number;
    presence_penalty?: number;
  };
}

export interface ChatCompletionResponse {
  rawContent: string;
  structuredContent?: any;
}
