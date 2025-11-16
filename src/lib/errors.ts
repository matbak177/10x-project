// src/lib/errors.ts
import { ApiService } from "@/lib/services/api.service";
import type { SupabaseClient } from "@/db/supabase.client";

export class AiServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AiServiceError";
  }
}

export const handleApiError = (e: unknown, supabase: SupabaseClient) => {
  console.error(e);

  class ErrorApiService extends ApiService {
    constructor(supabase: SupabaseClient) {
      super(supabase);
    }

    public static handleError(supabase: SupabaseClient, message: string, status = 500) {
      const instance = new ErrorApiService(supabase);
      return instance.serverError(message, status);
    }
  }

  return ErrorApiService.handleError(supabase, "Wystąpił nieoczekiwany błąd.");
};
