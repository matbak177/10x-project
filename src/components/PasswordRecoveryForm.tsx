import React, { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const passwordRecoverySchema = z.object({
  email: z.string().email({ message: "Nieprawidłowy format email." }),
});

type FormData = z.infer<typeof passwordRecoverySchema>;

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

export function PasswordRecoveryForm() {
  const [formState, setFormState] = useState<FormState>(initialState);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setFormState(initialState);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email");

    const result = passwordRecoverySchema.safeParse({ email });

    if (!result.success) {
      setFormState({ errors: { fields: result.error.flatten().fieldErrors } });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/password-recovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });

      if (!response.ok) {
        const { error } = await response.json();
        setFormState({ errors: { form: error.message, fields: error } });
      } else {
        setFormState({ message: "Jeśli konto istnieje, link do resetowania hasła został wysłany." });
      }
    } catch {
      setFormState({ errors: { form: "Nie udało się połączyć z serwerem." } });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Odzyskiwanie hasła</CardTitle>
        <CardDescription>Wprowadź swój adres email, aby otrzymać link do zresetowania hasła.</CardDescription>
      </CardHeader>
      {formState.message ? (
        <CardContent>
          <p className="text-center text-green-500">{formState.message}</p>
        </CardContent>
      ) : (
        <form onSubmit={handleSubmit}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="m@example.com" required disabled={isLoading} />
              {formState.errors.fields?.email && (
                <p className="text-sm text-red-500">{formState.errors.fields.email}</p>
              )}
            </div>
            {formState.errors.form && <p className="text-sm text-red-500 text-center">{formState.errors.form}</p>}
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Wysyłanie..." : "Wyślij link"}
            </Button>
          </CardFooter>
        </form>
      )}
    </Card>
  );
}
