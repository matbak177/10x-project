import { z } from "zod";
import type { APIRoute } from "astro";
import { ApiService } from "@/lib/services/api.service";
import { handleApiError } from "@/lib/errors";

const passwordRecoverySchema = z.object({
  email: z.string().email({ message: "Nieprawidłowy format email." }),
});

class AuthService extends ApiService {
  async sendPasswordRecovery(body: unknown, redirectTo: string) {
    const result = passwordRecoverySchema.safeParse(body);

    if (!result.success) {
      return this.clientError(result.error.flatten().fieldErrors);
    }

    const { error } = await this.supabase.auth.resetPasswordForEmail(result.data.email, {
      redirectTo,
    });

    if (error) {
      // Don't expose that the user does not exist or other errors
      // eslint-disable-next-line no-console
      console.error(error);
    }

    // Always return a success response to prevent email enumeration
    return this.success();
  }
}

export const POST: APIRoute = async ({ request, locals, url }) => {
  try {
    const authService = new AuthService(locals.supabase);
    const body = await request.json();

    const redirectTo = `${url.origin}/password-reset`;

    return authService.sendPasswordRecovery(body, redirectTo);
  } catch (e) {
    return handleApiError(e, locals.supabase);
  }
};
