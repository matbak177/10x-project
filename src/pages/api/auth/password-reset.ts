import { z } from "zod";
import type { APIRoute } from "astro";
import { ApiService } from "@/lib/services/api.service";
import { handleApiError } from "@/lib/errors";

const passwordResetSchema = z.object({
  password: z.string().min(6, { message: "Hasło musi mieć co najmniej 6 znaków." }),
  accessToken: z.string().min(1, { message: "Brak tokenu dostępu." }),
});

class AuthService extends ApiService {
  async resetPassword(body: unknown) {
    const result = passwordResetSchema.safeParse(body);

    if (!result.success) {
      return this.clientError(result.error.flatten().fieldErrors);
    }

    const { accessToken, password } = result.data;

    const {
      data: { user },
      error: userError,
    } = await this.supabase.auth.getUser(accessToken);

    if (userError || !user) {
      return this.unauthorized("Nieprawidłowy lub wygasły token.");
    }

    const { error: updateError } = await this.supabase.auth.admin.updateUserById(user.id, { password });

    if (updateError) {
      return this.serverError("Nie udało się zaktualizować hasła.");
    }

    return this.success();
  }
}

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const authService = new AuthService(locals.supabase);
    const body = await request.json();

    return authService.resetPassword(body);
  } catch (e) {
    return handleApiError(e, locals.supabase);
  }
};
