import { z } from "zod";
import type { APIRoute } from "astro";
import { ApiService } from "@/lib/services/api.service";
import { handleApiError } from "@/lib/errors";

const registerSchema = z.object({
  email: z.string().email({ message: "Nieprawidłowy format email." }),
  password: z.string().min(6, { message: "Hasło musi mieć co najmniej 6 znaków." }),
});

class AuthService extends ApiService {
  async register(body: unknown) {
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return this.clientError(result.error.flatten().fieldErrors);
    }

    const { error } = await this.supabase.auth.signUp(result.data);

    if (error) {
      // TODO: Lepsza obsługa błędów, np. sprawdzanie czy użytkownik już istnieje
      return this.clientError({ message: error.message });
    }

    return this.success(null, 201);
  }
}

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const authService = new AuthService(locals.supabase);
    const body = await request.json();

    return authService.register(body);
  } catch (e) {
    return handleApiError(e, locals.supabase);
  }
};
