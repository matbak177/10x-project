import React, { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const registerSchema = z
  .object({
    email: z.string().email({ message: "Nieprawidłowy format email." }),
    password: z.string().min(6, { message: "Hasło musi mieć co najmniej 6 znaków." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła nie są takie same.",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof registerSchema>;

interface FormState {
  errors: {
    form?: string;
    fields?: Partial<Record<keyof FormData, string[]>>;
  };
}

const initialState: FormState = {
  errors: {},
};

export function RegisterForm() {
  const [formState, setFormState] = useState<FormState>(initialState);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setFormState(initialState);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");
    const confirmPassword = formData.get("confirm-password");

    const result = registerSchema.safeParse({
      email,
      password,
      confirmPassword,
    });

    if (!result.success) {
      setFormState({ errors: { fields: result.error.flatten().fieldErrors } });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: result.data.email, password: result.data.password }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        setFormState({ errors: { form: error.message, fields: error } });
      } else {
        window.location.href = "/generate";
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
        <CardTitle className="text-2xl">Rejestracja</CardTitle>
        <CardDescription>Wprowadź swoje dane, aby utworzyć konto.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="m@example.com" required disabled={isLoading} />
            {formState.errors.fields?.email && <p className="text-sm text-red-500">{formState.errors.fields.email}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Hasło</Label>
            <Input id="password" name="password" type="password" required disabled={isLoading} />
            {formState.errors.fields?.password && (
              <p className="text-sm text-red-500">{formState.errors.fields.password}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirm-password">Powtórz hasło</Label>
            <Input id="confirm-password" name="confirm-password" type="password" required disabled={isLoading} />
            {formState.errors.fields?.confirmPassword && (
              <p className="text-sm text-red-500">{formState.errors.fields.confirmPassword}</p>
            )}
          </div>
          {formState.errors.form && <p className="text-sm text-red-500 text-center">{formState.errors.form}</p>}
        </CardContent>
        <CardFooter className="flex flex-col">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Rejestracja..." : "Zarejestruj się"}
          </Button>
          <div className="mt-4 text-center text-sm">
            Masz już konto?{" "}
            <a href="/login" className="underline">
              Zaloguj się
            </a>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
