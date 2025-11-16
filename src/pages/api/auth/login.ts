import { z } from "zod";
import type { APIRoute } from "astro";
import { ApiService } from "@/lib/services/api.service";
import { handleApiError } from "@/lib/errors";

const loginSchema = z.object({
  email: z.string().email({ message: "Nieprawidłowy format email." }),
  password: z.string().min(1, { message: "Hasło jest wymagane." }),
});

class AuthService extends ApiService {
  async login(body: unknown) {
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return this.clientError(result.error.flatten().fieldErrors);
    }

    const { error } = await this.supabase.auth.signInWithPassword(result.data);

    if (error) {
      return this.unauthorized("Nieprawidłowy email lub hasło.");
    }

    return this.success();
  }
}

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const authService = new AuthService(locals.supabase);
    const body = await request.json();

    return authService.login(body);
  } catch (e) {
    return handleApiError(e, locals.supabase);
  }
};
