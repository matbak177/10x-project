# Przewodnik Implementacji Usługi OpenRouter

Niniejszy dokument stanowi szczegółowy przewodnik dla programistów w celu wdrożenia usługi `OpenRouterService` w aplikacji opartej na Astro i TypeScript. Usługa ta będzie hermetyzować logikę interakcji z API OpenRouter w celu generowania uzupełnień czatów LLM.

## 1. Opis usługi

`OpenRouterService` będzie klasą po stronie serwera, odpowiedzialną za:

- Bezpieczne zarządzanie kluczem API OpenRouter.
- Konstruowanie poprawnych zapytań do API, włączając w to wiadomości, parametry modelu oraz formatowanie odpowiedzi.
- Wysyłanie zapytań do punktu końcowego API OpenRouter.
- Parsowanie odpowiedzi, w tym obsługa ustrukturyzowanych danych JSON.
- Ujednoliconą obsługę błędów sieciowych i błędów API.

Usługa zostanie zaimplementowana jako singleton lub klasa z metodą statyczną `getInstance()`, aby zapewnić, że w całej aplikacji istnieje tylko jedna instancja, co zapobiega zbędnemu ponownemu odczytywaniu zmiennych środowiskowych.

## 2. Opis konstruktora

Konstruktor klasy będzie prywatny, aby wymusić wzorzec singleton. Inicjalizacja będzie odbywać się za pośrednictwem publicznej metody statycznej.

`private constructor(apiKey: string)`

- **`apiKey`**: Klucz API OpenRouter odczytany ze zmiennych środowiskowych.

`public static getInstance(): OpenRouterService`

- Ta metoda sprawdzi, czy instancja usługi już istnieje. Jeśli nie, utworzy nową, odczytując klucz `OPENROUTER_API_KEY` z `import.meta.env`.
- Rzuci błędem `Error` podczas uruchamiania serwera, jeśli klucz API nie zostanie znaleziony w zmiennych środowiskowych, zapobiegając nieprawidłowemu działaniu usługi w trakcie działania.

## 3. Publiczne metody i pola

### Główne Metody

**`public async getChatCompletion(options: ChatCompletionOptions): Promise<ChatCompletionResponse>`**

Jest to główna metoda usługi. Będzie przyjmować jeden obiekt konfiguracyjny i zwracać odpowiedź od modelu.

- **`options: ChatCompletionOptions`**: Obiekt zawierający wszystkie parametry zapytania.

  ```typescript
  // Proponowana definicja w src/types.ts
  export interface ChatCompletionOptions {
    model?: string;
    userMessage: string;
    systemMessage?: string;
    responseSchema?: {
      name: string;
      schema: object; // JSON Schema object
    };
    params?: {
      temperature?: number; // 0.0 to 2.0
      top_p?: number; // 0.0 to 1.0
      frequency_penalty?: number; // -2.0 to 2.0
      presence_penalty?: number; // -2.0 to 2.0
    };
  }

  export interface ChatCompletionResponse {
    rawContent: string;
    structuredContent?: any; // Parsed JSON object if schema was used
  }
  ```

### Przykłady użycia

#### 1. Proste zapytanie

```typescript
const openRouterService = OpenRouterService.getInstance();
const response = await openRouterService.getChatCompletion({
  userMessage: "Czym jest Astro?",
  model: "openai/gpt-3.5-turbo",
});
console.log(response.rawContent);
```

#### 2. Zapytanie z komunikatem systemowym i parametrami

```typescript
const response = await openRouterService.getChatCompletion({
  userMessage: "Napisz krótką historię o kosmosie.",
  systemMessage: "Jesteś kreatywnym pisarzem science-fiction.",
  model: "mistralai/mistral-7b-instruct",
  params: {
    temperature: 1.4,
  },
});
```

#### 3. Zapytanie o ustrukturyzowaną odpowiedź (JSON)

```typescript
const userSchema = {
  type: "object",
  properties: {
    fullName: { type: "string", description: "Pełne imię i nazwisko użytkownika." },
    userEmail: { type: "string", description: "Adres e-mail użytkownika." },
  },
  required: ["fullName", "userEmail"],
};

const response = await openRouterService.getChatCompletion({
  userMessage: "Moje dane to Jan Kowalski, a mój e-mail to jan.kowalski@example.com.",
  systemMessage: "Wyodrębnij dane użytkownika z podanego tekstu.",
  responseSchema: {
    name: "userExtractor",
    schema: userSchema,
  },
});

if (response.structuredContent) {
  console.log(response.structuredContent.fullName); // "Jan Kowalski"
  console.log(response.structuredContent.userEmail); // "jan.kowalski@example.com"
}
```

## 4. Prywatne metody i pola

- **`private static instance: OpenRouterService;`**: Przechowuje instancję singletona.
- **`private readonly apiKey: string;`**: Przechowuje klucz API.
- **`private readonly apiUrl = 'https://openrouter.ai/api/v1/chat/completions';`**: Punkt końcowy API.
- **`private _buildPayload(options: ChatCompletionOptions): object`**: Prywatna metoda pomocnicza do budowania obiektu JSON, który zostanie wysłany jako ciało żądania POST. Będzie ona odpowiedzialna za prawidłowe formatowanie wiadomości, `response_format`, `model` i innych parametrów.
- **`private _sendRequest(payload: object): Promise<Response>`**: Metoda obsługująca wywołanie `fetch` do API OpenRouter, w tym ustawienie nagłówków `Authorization`, `Content-Type` oraz `HTTP-Referer`.
- **`private _handleResponse(response: Response, expectJson: boolean): Promise<ChatCompletionResponse>`**: Metoda do parsowania odpowiedzi HTTP. Sprawdzi status odpowiedzi i rzuci błędem w przypadku niepowodzenia. Jeśli odpowiedź ma być w formacie JSON (`expectJson = true`), spróbuje sparsować zawartość.

## 5. Obsługa błędów

Usługa będzie implementować niestandardowe klasy błędów, aby umożliwić konsumentowi (np. punktowi końcowemu API Astro) odpowiednie reagowanie.

- **`OpenRouterServiceError`**: Podstawowa klasa błędu dla tej usługi.
- **`ConfigurationError extends OpenRouterServiceError`**: Rzucany, gdy brakuje klucza API.
- **`ApiError extends OpenRouterServiceError`**: Rzucany w przypadku błędów zwróconych przez API OpenRouter (status 4xx lub 5xx). Będzie zawierał kod statusu i wiadomość z API.
- **`NetworkError extends OpenRouterServiceError`**: Rzucany w przypadku problemów z połączeniem sieciowym podczas wywoływania `fetch`.
- **`ResponseParseError extends OpenRouterServiceError`**: Rzucany, gdy odpowiedź modelu miała być w formacie JSON, ale parsowanie się nie powiodło.

**Przykład obsługi błędów w punkcie końcowym API Astro:**

```typescript
// src/pages/api/chat.ts
import { OpenRouterService, ApiError } from '@/lib/OpenRouterService';

// ...
try {
  const response = await service.getChatCompletion(...);
  // return new Response(JSON.stringify(response));
} catch (error) {
  if (error instanceof ApiError) {
    // return new Response(error.message, { status: error.status });
  }
  // return new Response("Wystąpił wewnętrzny błąd serwera", { status: 500 });
}
```

## 6. Kwestie bezpieczeństwa

1.  **Zarządzanie kluczem API**: Klucz API **nigdy** nie może być ujawniony po stronie klienta. Musi być przechowywany w pliku `.env` (i `.env.development`, `.env.production`) i odczytywany wyłącznie po stronie serwera za pomocą `import.meta.env.OPENROUTER_API_KEY`. Plik `.env` musi być dodany do `.gitignore`.
2.  **Walidacja danych wejściowych**: Chociaż usługa nie przetwarza bezpośrednio danych wrażliwych, punkty końcowe API, które ją wykorzystują, powinny walidować dane wejściowe od użytkowników, aby zapobiec atakom typu prompt injection.
3.  **Referer**: API OpenRouter wymaga wysyłania nagłówka `HTTP-Referer`. Należy ustawić go na adres URL witryny lub aplikacji.

## 7. Plan wdrożenia krok po kroku

### Krok 1: Konfiguracja środowiska

1.  Utwórz plik `.env` w głównym katalogu projektu.
2.  Dodaj do niego swój klucz API OpenRouter:
    ```
    OPENROUTER_API_KEY="sk-or-v1-..."
    ```
3.  Upewnij się, że `.env` jest dodany do pliku `.gitignore`.

### Krok 2: Definicja typów

W pliku `src/types.ts` dodaj interfejsy zdefiniowane w sekcji 3.

```typescript
// src/types.ts
export interface ChatCompletionOptions {
  model?: string;
  userMessage: string;
  systemMessage?: string;
  responseSchema?: {
    name: string;
    schema: object;
  };
  params?: {
    temperature?: number;
    top_p?: number;
    frequency_penalty?: number;
    presence_penalty?: number;
  };
}

export interface ChatCompletionResponse {
  rawContent: string;
  structuredContent?: any;
}
```

### Krok 3: Implementacja klasy `OpenRouterService`

Utwórz nowy plik `src/lib/OpenRouterService.ts`.

```typescript
// src/lib/OpenRouterService.ts

import type { ChatCompletionOptions, ChatCompletionResponse } from "@/types";

// Definicje niestandardowych błędów
export class OpenRouterServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}
export class ConfigurationError extends OpenRouterServiceError {}
export class ApiError extends OpenRouterServiceError {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.status = status;
  }
}
export class NetworkError extends OpenRouterServiceError {}
export class ResponseParseError extends OpenRouterServiceError {}

export class OpenRouterService {
  private static instance: OpenRouterService;
  private readonly apiKey: string;
  private readonly apiUrl = "https://openrouter.ai/api/v1/chat/completions";

  private constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  public static getInstance(): OpenRouterService {
    if (!OpenRouterService.instance) {
      const apiKey = import.meta.env.OPENROUTER_API_KEY;
      if (!apiKey) {
        throw new ConfigurationError("Zmienna środowiskowa OPENROUTER_API_KEY nie jest ustawiona.");
      }
      OpenRouterService.instance = new OpenRouterService(apiKey);
    }
    return OpenRouterService.instance;
  }

  public async getChatCompletion(options: ChatCompletionOptions): Promise<ChatCompletionResponse> {
    const payload = this._buildPayload(options);

    try {
      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": import.meta.env.SITE_URL || "http://localhost:4321", // Zastąp lub skonfiguruj
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        const errorMessage = errorBody?.error?.message || `Błąd API: ${response.statusText}`;
        throw new ApiError(errorMessage, response.status);
      }

      const responseData = await response.json();
      const rawContent = responseData.choices[0]?.message?.content || "";

      if (options.responseSchema) {
        try {
          const structuredContent = JSON.parse(rawContent);
          return { rawContent, structuredContent };
        } catch (e) {
          throw new ResponseParseError("Nie udało się sparsować odpowiedzi JSON od modelu.");
        }
      }

      return { rawContent };
    } catch (error) {
      if (error instanceof ApiError || error instanceof ResponseParseError) {
        throw error;
      }
      // Zakładamy, że inne błędy to problemy sieciowe
      throw new NetworkError(`Błąd sieci podczas komunikacji z OpenRouter API: ${error.message}`);
    }
  }

  private _buildPayload(options: ChatCompletionOptions): object {
    const messages: { role: string; content: string }[] = [];

    if (options.systemMessage) {
      messages.push({ role: "system", content: options.systemMessage });
    }
    messages.push({ role: "user", content: options.userMessage });

    const payload: any = {
      model: options.model || "openai/gpt-3.5-turbo", // Model domyślny
      messages,
      ...options.params,
    };

    if (options.responseSchema) {
      payload.response_format = {
        type: "json_schema",
        json_schema: {
          name: options.responseSchema.name,
          strict: true,
          schema: options.responseSchema.schema,
        },
      };
    }

    return payload;
  }
}
```

### Krok 4: Utworzenie punktu końcowego API w Astro

Utwórz plik `src/pages/api/chat.ts` do obsługi żądań od klienta.

```typescript
// src/pages/api/chat.ts
import type { APIRoute } from "astro";
import { OpenRouterService, ApiError, OpenRouterServiceError } from "@/lib/OpenRouterService";

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    // TODO: Dodaj walidację danych wejściowych `body` (np. za pomocą Zod)

    const service = OpenRouterService.getInstance();
    const response = await service.getChatCompletion({
      userMessage: body.message,
      // Przekaż inne opcje z `body` w razie potrzeby
    });

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error); // Logowanie błędu po stronie serwera

    if (error instanceof ApiError) {
      return new Response(JSON.stringify({ error: error.message }), { status: error.status });
    }
    if (error instanceof OpenRouterServiceError) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    }

    return new Response(JSON.stringify({ error: "Wystąpił wewnętrzny błąd serwera" }), { status: 500 });
  }
};
```

### Krok 5: Wywołanie API z komponentu front-endowego

Przykład użycia w komponencie React (`.tsx`):

```tsx
// src/components/ChatComponent.tsx
import React, { useState } from "react";

const ChatComponent = () => {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResponse("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Coś poszło nie tak");
      }

      const data = await res.json();
      setResponse(data.rawContent);
    } catch (error) {
      setResponse(`Błąd: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Zapytaj o coś..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Myślenie..." : "Wyślij"}
        </button>
      </form>
      {response && <p>{response}</p>}
    </div>
  );
};

export default ChatComponent;
```
