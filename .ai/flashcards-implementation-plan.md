# API Endpoint Implementation Plan: POST /flashcards

## 1. Przegląd punktu końcowego
Ten punkt końcowy umożliwia tworzenie jednej lub wielu fiszek. Może być używany zarówno do dodawania fiszek wprowadzanych ręcznie przez użytkownika, jak i do akceptowania propozycji wygenerowanych przez AI, powiązując je z odpowiednią sesją generowania.

## 2. Szczegóły żądania
- **Metoda HTTP**: `POST`
- **Struktura URL**: `/flashcards`
- **Request Body**: Ciało żądania musi zawierać obiekt JSON z jednym polem `flashcards`, które jest tablicą obiektów do utworzenia.
  - **Struktura**:
    ```json
    {
      "flashcards": [
        {
          "front": "Tekst na awersie fiszki 1",
          "back": "Tekst na rewersie fiszki 1",
          "source": "manual",
          "generation_id": null
        },
        {
          "front": "Pytanie z generacji AI",
          "back": "Odpowiedź z generacji AI",
          "source": "ai-full",
          "generation_id": 42
        }
      ]
    }
    ```
- **Walidacja**:
  - `flashcards`: Wymagana, `array`, niepusta.
  - `flashcards[].front`: Wymagany, `string`, `min: 1`, `max: 200`.
  - `flashcards[].back`: Wymagany, `string`, `min: 1`, `max: 500`.
  - `flashcards[].source`: Wymagany, `string`, musi być jedną z wartości: `"manual"`, `"ai-full"`, `"ai-edited"`.
  - `flashcards[].generation_id`: Wymagany, `number` lub `null`. Musi być `null`, jeśli `source` to `"manual"`.

## 3. Wykorzystywane typy
- **`FlashcardsCreateCommand`**: Nowy model polecenia reprezentujący całe ciało żądania.
  ```typescript
  // Należy dodać w src/types.ts
  export interface FlashcardsCreateCommand {
    flashcards: FlashcardCreateDto[];
  }
  ```
- **`FlashcardCreateDto`**: Istniejący DTO dla pojedynczej fiszki do utworzenia.
- **`FlashcardDto`**: Istniejący DTO używany w odpowiedzi, reprezentujący utworzoną fiszkę.

## 4. Szczegóły odpowiedzi
- **Odpowiedź sukcesu (201 Created)**: Zwraca tablicę nowo utworzonych obiektów fiszek.
  ```json
  [
    {
      "id": 1,
      "front": "Tekst na awersie fiszki 1",
      "back": "Tekst na rewersie fiszki 1",
      "source": "manual",
      "generation_id": null,
      "created_at": "2025-11-13T10:00:00Z",
      "updated_at": "2025-11-13T10:00:00Z"
    }
  ]
  ```
- **Odpowiedzi błędów**:
  - `400 Bad Request`: Błąd walidacji danych wejściowych.
  - `401 Unauthorized`: Użytkownik nie jest uwierzytelniony.
  - `500 Internal Server Error`: Wewnętrzny błąd serwera, np. problem z bazą danych.

## 5. Przepływ danych
1.  **Odbiór żądania**: Serwer otrzymuje żądanie `POST` na `/api/flashcards`.
2.  **Uwierzytelnienie**: Middleware Astro weryfikuje token JWT użytkownika. Jeśli jest nieprawidłowy, zwraca `401`. Dane użytkownika i sesja są dostępne w `context.locals`.
3.  **Walidacja**: Handler endpointu waliduje ciało żądania przy użyciu predefiniowanego schematu Zod. W przypadku błędu zwraca `400` ze szczegółami.
4.  **Wywołanie serwisu**: Handler wywołuje metodę `createFlashcards` z nowo utworzonego `FlashcardService`, przekazując tablicę fiszek z żądania oraz ID uwierzytelnionego użytkownika (`context.locals.user.id`).
5.  **Operacja na bazie danych**: `FlashcardService` mapuje DTO na obiekty `FlashcardInsert`, dodając do każdego z nich `user_id`. Następnie wykonuje operację `insert` na tabeli `flashcards` przy użyciu klienta Supabase w jednej transakcji.
6.  **Obsługa wyniku**: Jeśli operacja w bazie danych powiedzie się, serwis zwraca listę nowo utworzonych fiszek.
7.  **Zwrócenie odpowiedzi**: Handler endpointu otrzymuje dane z serwisu i zwraca odpowiedź `201 Created` z tablicą utworzonych fiszek w formacie `FlashcardDto[]`.

## 6. Względy bezpieczeństwa
- **Uwierzytelnienie i Autoryzacja**: Dostęp do endpointu jest ograniczony do uwierzytelnionych użytkowników poprzez middleware Astro i Supabase Auth.
- **Row-Level Security (RLS)**: Polityki RLS w bazie danych PostgreSQL zapewniają, że operacja wstawienia powiedzie się tylko wtedy, gdy `user_id` w rekordzie odpowiada `auth.uid()` użytkownika wykonującego żądanie. To zapobiega tworzeniu fiszek w imieniu innych użytkowników.
- **Walidacja danych wejściowych**: Użycie Zod do walidacji danych chroni przed niepoprawnymi danymi i atakami typu NoSQL/SQL Injection (choć Supabase SDK już parametryzuje zapytania).

## 7. Obsługa błędów
- **Błędne dane wejściowe (400)**: Jeśli walidacja Zod nie powiedzie się, system zwróci odpowiedź `400` z komunikatem o błędach walidacji.
- **Brak uwierzytelnienia (401)**: Middleware Astro automatycznie obsłuży ten przypadek, jeśli użytkownik nie jest zalogowany.
- **Błąd bazy danych (500)**: Każdy wyjątek rzucony podczas operacji na bazie danych w `FlashcardService` zostanie przechwycony. Błąd zostanie zalogowany po stronie serwera, a do klienta zostanie zwrócona generyczna odpowiedź `500 Internal Server Error`.

## 8. Rozważania dotyczące wydajności
- **Operacje masowe**: Supabase SDK pozwala na wstawianie wielu rekordów w jednym wywołaniu (`.insert([...])`), co jest wydajne i powinno być domyślnym podejściem.
- **Limit żądania**: Aby zapobiec nadużyciom i problemom z wydajnością, należy rozważyć wprowadzenie limitu na liczbę fiszek, które można utworzyć w jednym żądaniu (np. 100).

## 9. Etapy wdrożenia
2.  **Utworzenie pliku endpointu**: Stworzyć plik `src/pages/api/flashcards.ts`.
3.  **Implementacja walidacji**: W `flashcards.ts` zdefiniować schemat walidacji Zod dla `FlashcardCreateCommand`. Schemat powinien weryfikować strukturę tablicy `flashcards` oraz każdego obiektu w niej, łącznie z logiką warunkową dla `generation_id`.
4.  **Stworzenie serwisu**: Utworzyć plik `src/lib/services/flashcard.service.ts` i zaimplementować w nim `FlashcardService`. Serwis powinien zawierać metodę `createFlashcards`, która przyjmuje tablicę `FlashcardCreateDto` oraz `user_id` i zapisuje dane w bazie.
5.  **Implementacja logiki endpointu**: W `flashcards.ts` zaimplementować handler `POST`, który:
    - Korzysta z mechanizmu uwierzytelniania Supabase Auth
    - Wykorzystuje zdefiniowany schemat Zod do walidacji żądania.
    - Wywołuje `FlashcardService` w celu zapisania danych.
    - Zwraca odpowiedź `201 Created` z danymi nowo utworzonych fiszek.
6.  **Dodanie szczegółowego logowania**: Zaimplementować logowanie błędów po stronie serwera w przypadku problemów z bazą danych lub innych nieoczekiwanych wyjątków.
