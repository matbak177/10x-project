import { describe, it, expect, vi } from "vitest";
import { POST } from "@/pages/api/auth/login";
import type { APIContext } from "astro";

vi.mock("@/lib/services/api.service", () => {
  const ApiService = vi.fn();
  ApiService.prototype.clientError = vi
    .fn()
    .mockImplementation((errors) => new Response(JSON.stringify({ errors }), { status: 400 }));
  ApiService.prototype.unauthorized = vi
    .fn()
    .mockImplementation((message) => new Response(JSON.stringify({ message }), { status: 401 }));
  ApiService.prototype.success = vi.fn().mockImplementation(() => new Response(null, { status: 200 }));
  return { ApiService };
});

vi.mock("@/lib/errors", () => ({
  handleApiError: vi.fn(),
}));

describe("Login API", () => {
  it("should return client error for invalid data", async () => {
    const request = new Request("http://localhost/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "invalid-email", password: "" }),
      headers: { "Content-Type": "application/json" },
    });

    const context = {
      request,
      locals: {
        supabase: {},
      },
    } as unknown as APIContext;

    const response = await POST(context);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.errors).toHaveProperty("email");
    expect(data.errors).toHaveProperty("password");
  });
});
