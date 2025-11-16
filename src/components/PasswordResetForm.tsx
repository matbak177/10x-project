import React, { useState, useEffect } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const passwordResetSchema = z
  .object({
    password: z.string().min(6, { message: "Hasło musi mieć co najmniej 6 znaków." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła nie są takie same.",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof passwordResetSchema>;

interface FormState {
  errors: {
    form?: string;
    fields?: Partial<Record<keyof FormData, string[]>>;
  };
  message?: string;
}

const initialState: FormState = {
  errors: {},
};

export function PasswordResetForm() {
  const [formState, setFormState] = useState<FormState>(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [accessDenied, setAccessDenied] = useState(true);

  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.substring(1)); // remove #
    const accessToken = params.get("access_token");

    if (accessToken) {
      setAccessDenied(false);
    } else {
      setAccessDenied(true);
      setFormState({ errors: { form: "Brak tokenu, dostęp zabroniony. Spróbuj ponownie wysłać link." } });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setFormState(initialState);

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password");
    const confirmPassword = formData.get("confirm-password");

    const result = passwordResetSchema.safeParse({
      password,
      confirmPassword,
    });

    if (!result.success) {
      setFormState({ errors: { fields: result.error.flatten().fieldErrors } });
      setIsLoading(false);
      return;
    }

    try {
      const hash = window.location.hash;
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get("access_token");

      const response = await fetch("/api/auth/password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: result.data.password, accessToken }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        setFormState({ errors: { form: error.message, fields: error } });
      } else {
        setFormState({ message: "Hasło zostało pomyślnie zmienione." });
      }
    } catch (err) {
      setFormState({ errors: { form: "Nie udało się połączyć z serwerem." } });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Resetowanie hasła</CardTitle>
        <CardDescription>Wprowadź nowe hasło.</CardDescription>
      </CardHeader>
      {formState.message ? (
        <CardContent>
          <p className="text-center text-green-500">{formState.message}</p>
          <div className="mt-4 text-center text-sm">
            <a href="/login" className="underline">
              Wróć do logowania
            </a>
          </div>
        </CardContent>
      ) : (
        <form onSubmit={handleSubmit}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="password">Nowe hasło</Label>
              <Input id="password" name="password" type="password" required disabled={isLoading || accessDenied} />
              {formState.errors.fields?.password && (
                <p className="text-sm text-red-500">{formState.errors.fields.password}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Powtórz nowe hasło</Label>
              <Input
                id="confirm-password"
                name="confirm-password"
                type="password"
                required
                disabled={isLoading || accessDenied}
              />
              {formState.errors.fields?.confirmPassword && (
                <p className="text-sm text-red-500">{formState.errors.fields.confirmPassword}</p>
              )}
            </div>
            {formState.errors.form && <p className="text-sm text-red-500 text-center">{formState.errors.form}</p>}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading || accessDenied}>
              {isLoading ? "Zapisywanie..." : "Zapisz nowe hasło"}
            </Button>
          </CardFooter>
        </form>
      )}
    </Card>
  );
}
