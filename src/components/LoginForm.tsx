import React, { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const loginSchema = z.object({
  email: z.string().email({ message: "Nieprawidłowy format email." }),
  password: z.string().min(1, { message: "Hasło jest wymagane." }),
});

type FormData = z.infer<typeof loginSchema>;

interface FormState {
  errors: {
    form?: string;
    fields?: Partial<Record<keyof FormData, string[]>>;
  };
}

const initialState: FormState = {
  errors: {},
};

export function LoginForm() {
  const [formState, setFormState] = useState<FormState>(initialState);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setFormState(initialState);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      setFormState({ errors: { fields: result.error.flatten().fieldErrors } });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
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
        <CardTitle className="text-2xl">Logowanie</CardTitle>
        <CardDescription>Wprowadź swój email i hasło, aby się zalogować.</CardDescription>
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
          {formState.errors.form && <p className="text-sm text-red-500 text-center">{formState.errors.form}</p>}
        </CardContent>
        <CardFooter className="flex flex-col">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Logowanie..." : "Zaloguj się"}
          </Button>
        </CardFooter>
      </form>
      <div className="mt-4 text-center text-sm">
        Nie masz konta?{" "}
        <a href="/register" className="underline" data-astro-reload>
          Zarejestruj się
        </a>
      </div>
      <div className="mt-2 text-center text-sm">
        <a href="/password-recovery" className="underline">
          Zapomniałeś hasła?
        </a>
      </div>
    </Card>
  );
}
