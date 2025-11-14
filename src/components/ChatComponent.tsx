import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const ChatComponent = () => {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsLoading(true);
    setResponse("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userMessage: message }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Nie udało się odczytać błędu z serwera." }));
        throw new Error(errorData.error || "Wystąpił nieznany błąd");
      }

      const data = await res.json();
      setResponse(data.rawContent);
    } catch (error) {
      if (error instanceof Error) {
        setResponse(`Błąd: ${error.message}`);
      } else {
        setResponse("Wystąpił nieoczekiwany błąd.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Test OpenRouter Service</CardTitle>
        <CardDescription>Wpisz wiadomość, aby przetestować integrację z API OpenRouter.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Zapytaj o coś..."
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Przetwarzanie..." : "Wyślij"}
          </Button>
        </form>
      </CardContent>
      {response && (
        <CardFooter>
          <div className="mt-4 p-4 bg-muted rounded-md w-full">
            <p className="text-sm font-semibold mb-2">Odpowiedź:</p>
            <p className="text-sm whitespace-pre-wrap">{response}</p>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default ChatComponent;
