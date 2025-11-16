import type { SupabaseClient } from "@/db/supabase.client";

export class ApiService {
  constructor(protected supabase: SupabaseClient) {}

  protected success<T>(data?: T, status = 200) {
    if (!data) {
      return new Response(null, { status });
    }

    return new Response(JSON.stringify(data), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }

  protected clientError(error: unknown, status = 400) {
    return new Response(JSON.stringify({ error }), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }

  protected serverError(message: string, status = 500) {
    // eslint-disable-next-line no-console
    console.error(message);
    return new Response(JSON.stringify({ error: { message } }), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }

  protected unauthorized(message: string) {
    return new Response(JSON.stringify({ error: { message } }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
}
