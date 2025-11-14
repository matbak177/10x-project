import type { FlashcardProposalDto, GenerateFlashcardsCommand } from "../../types";
import type { SupabaseClient } from "../../db/supabase.client";
import { createHash } from "crypto";
import { OpenRouterService, OpenRouterServiceError } from "@/lib/openrouter.service";

export const prerender = false;

interface GenerationResult {
  generationId: number;
  flashcardProposals: FlashcardProposalDto[];
  generatedCount: number;
}

const flashcardsSchema = {
  type: "object",
  properties: {
    flashcards: {
      type: "array",
      description: "An array of generated flashcards.",
      items: {
        type: "object",
        properties: {
          front: {
            type: "string",
            description: "The front side of the flashcard (question, term, concept).",
          },
          back: {
            type: "string",
            description: "The back side of the flashcard (answer, definition, explanation).",
          },
        },
        required: ["front", "back"],
      },
    },
  },
  required: ["flashcards"],
};

export class GenerationService {
  private supabase: SupabaseClient;
  private userId: string;

  constructor(supabase: SupabaseClient, userId: string) {
    this.supabase = supabase;
    this.userId = userId;
  }

  private async logGenerationError(details: {
    sourceTextHash: string;
    sourceTextLength: number;
    model: string;
    errorCode: string;
    errorMessage: string;
  }) {
    const { error } = await this.supabase.from("generation_error_logs").insert({
      user_id: this.userId,
      source_text_hash: details.sourceTextHash,
      source_text_length: details.sourceTextLength,
      model: details.model,
      error_code: details.errorCode,
      error_message: details.errorMessage,
    });

    if (error) {
      console.error("Critical: Failed to log generation error to the database:", error);
    }
  }

  async generateFlashcards(command: GenerateFlashcardsCommand): Promise<GenerationResult> {
    const startTime = Date.now();
    const sourceTextHash = createHash("md5").update(command.source_text).digest("hex");
    const model = "openai/gpt-4o-mini";

    let proposals: FlashcardProposalDto[];

    try {
      const openRouterService = OpenRouterService.getInstance();
      const systemMessage = `Jesteś asystentem AI, który tworzy fiszki edukacyjne. Analizujesz podany tekst i generujesz z niego zwięzłe, trafne fiszki. Każda fiszka musi mieć przód (pytanie lub pojęcie) i tył (odpowiedź lub definicja). Skup się na najważniejszych informacjach z tekstu. Twoja odpowiedź musi być wyłącznie w formacie JSON zgodnym z podanym schematem.`;

      const response = await openRouterService.getChatCompletion({
        model,
        userMessage: command.source_text,
        systemMessage,
        responseSchema: {
          name: "flashcardExtractor",
          schema: flashcardsSchema,
        },
      });

      if (!response.structuredContent || !Array.isArray(response.structuredContent.flashcards)) {
        throw new Error("Invalid structured content format from AI service.");
      }

      proposals = response.structuredContent.flashcards.map((card: any) => ({
        ...card,
        source: "ai-full" as const,
      }));
    } catch (aiError: any) {
      const errorCode = aiError instanceof OpenRouterServiceError ? "AI_SERVICE_ERROR" : "UNKNOWN_GENERATION_ERROR";

      await this.logGenerationError({
        sourceTextHash,
        sourceTextLength: command.source_text.length,
        model,
        errorCode,
        errorMessage: aiError.message,
      });

      // Re-throw the original error for the API route to handle and log.
      throw aiError;
    }

    const generatedCount = proposals.length;
    const generationDuration = Date.now() - startTime;

    const { data: generation, error: dbError } = await this.supabase
      .from("generations")
      .insert({
        user_id: this.userId,
        model,
        source_text_hash: sourceTextHash,
        source_text_length: command.source_text.length,
        generated_count: generatedCount,
        generation_duration: generationDuration,
      })
      .select("id")
      .single();

    if (dbError) {
      await this.logGenerationError({
        sourceTextHash,
        sourceTextLength: command.source_text.length,
        model,
        errorCode: "DATABASE_INSERT_ERROR",
        errorMessage: dbError.message,
      });
      console.error("Error saving generation to database:", dbError);
      throw new Error("Failed to save generation data.");
    }

    return {
      generationId: generation.id,
      flashcardProposals: proposals,
      generatedCount: generatedCount,
    };
  }
}
