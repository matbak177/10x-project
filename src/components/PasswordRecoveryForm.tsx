import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PasswordRecoveryForm() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Tutaj będzie logika wysyłania formularza
    console.log({ email });
    alert("Jeśli email istnieje w naszej bazie, wysłaliśmy link do resetu hasła.");
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Odzyskiwanie hasła</CardTitle>
        <CardDescription>Wprowadź swój email, aby otrzymać link do zresetowania hasła.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col">
          <Button type="submit" className="w-full">
            Wyślij link
          </Button>
          <div className="mt-4 text-center text-sm">
            <a href="/login" className="underline">
              Wróć do logowania
            </a>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
