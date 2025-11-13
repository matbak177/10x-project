import type { FlashcardProposalDto, GenerateFlashcardsCommand } from "../../types";
import type { SupabaseClient } from "../../db/supabase.client";
import { createHash } from "crypto";

export const prerender = false;

interface GenerationResult {
  generationId: number;
  flashcardProposals: FlashcardProposalDto[];
  generatedCount: number;
}

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
    const model = "mock-model";

    let mockProposals: FlashcardProposalDto[];
    try {
      // Mock AI service call. We simulate a failure if the text contains "FAIL".
      if (command.source_text.includes("FAIL")) {
        throw new Error("Simulated AI service failure: The model could not process the request.");
      }
      mockProposals = [
        { front: "Mock question 1?", back: "Mock answer 1.", source: "ai-full" },
        { front: "Mock question 2?", back: "Mock answer 2.", source: "ai-full" },
      ];
    } catch (aiError: any) {
      await this.logGenerationError({
        sourceTextHash,
        sourceTextLength: command.source_text.length,
        model,
        errorCode: "AI_SERVICE_ERROR",
        errorMessage: aiError.message,
      });
      // Re-throw a generic error to the client.
      throw new Error("AI service failed to generate flashcards.");
    }

    const generatedCount = mockProposals.length;
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
      flashcardProposals: mockProposals,
      generatedCount: generatedCount,
    };
  }
}
