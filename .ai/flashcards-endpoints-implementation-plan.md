# Plan implementacji punktów końcowych API: GET, PUT, DELETE /flashcards

Ten dokument opisuje plan wdrożenia dla punktów końcowych `GET`, `PUT` i `DELETE` zasobu `flashcards`. Uzupełnia on istniejący plan dla metody `POST`.

---

## API Endpoint Implementation Plan: `GET /flashcards`

### 1. Przegląd punktu końcowego
Ten punkt końcowy umożliwia pobieranie listy fiszek należących do uwierzytelnionego użytkownika z obsługą paginacji i sortowania.

### 2. Szczegóły żądania
- **Metoda HTTP**: `GET`
- **Struktura URL**: `/flashcards`
- **Parametry Zapytania (Query Parameters)**:
  - `page` (opcjonalny, `number`, domyślnie: `1`): Numer strony do pobrania.
  - `limit` (opcjonalny, `number`, domyślnie: `20`): Liczba wyników na stronie (max 100).
  - `sort` (opcjonalny, `string`, domyślnie: `'created_at'`): Pole, po którym odbywa się sortowanie. Dozwolone wartości: `created_at`, `updated_at`, `front`.
  - `order` (opcjonalny, `string`, domyślnie: `'desc'`): Kierunek sortowania. Dozwolone wartości: `asc`, `desc`.

### 3. Wykorzystywane typy
- **`FlashcardListResponseDto`**: Główny obiekt odpowiedzi.
- **`FlashcardDto`**: Reprezentacja pojedynczej fiszki na liście.
- **`PaginationDto`**: Obiekt zawierający metadane paginacji.

### 4. Szczegóły odpowiedzi
- **Odpowiedź sukcesu (200 OK)**: Zwraca obiekt zawierający listę fiszek i informacje o paginacji.
  ```json
  {
    "data": [
      {
        "id": 1,
        "front": "What is REST?",
        "back": "Representational State Transfer is an architectural style for...",
        "source": "manual",
        "generation_id": null,
        "created_at": "2025-11-13T10:00:00Z",
        "updated_at": "2025-11-13T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1
    }
  }
  ```
- **Odpowiedzi błędów**:
  - `400 Bad Request`: Błąd walidacji parametrów zapytania.
  - `401 Unauthorized`: Użytkownik nie jest uwierzytelniony.
  - `500 Internal Server Error`: Wewnętrzny błąd serwera.

### 5. Przepływ danych
1.  **Odbiór żądania**: Serwer odbiera żądanie `GET` na `/api/flashcards`.
2.  **Uwierzytelnienie**: Middleware Astro weryfikuje sesję użytkownika. W razie braku, zwraca `401`.
3.  **Walidacja**: Handler endpointu waliduje parametry zapytania (`page`, `limit`, `sort`, `order`) przy użyciu schematu Zod. W przypadku błędu zwraca `400`.
4.  **Wywołanie serwisu**: Handler wywołuje metodę `getFlashcards` z `FlashcardService`, przekazując ID użytkownika oraz zwalidowane opcje paginacji i sortowania.
5.  **Operacja na bazie danych**: Serwis wykonuje dwa zapytania do bazy danych Supabase: jedno do pobrania łącznej liczby fiszek użytkownika, a drugie do pobrania posortowanej i spaginowanej listy fiszek.
6.  **Zwrócenie odpowiedzi**: Handler formatuje dane otrzymane z serwisu do postaci `FlashcardListResponseDto` i zwraca odpowiedź `200 OK`.

### 6. Względy bezpieczeństwa
- **Uwierzytelnienie**: Dostęp jest ograniczony do uwierzytelnionych użytkowników.
- **Autoryzacja i RLS**: Zarówno logika serwisu (filtrowanie po `user_id`), jak i polityki RLS w bazie danych zapewniają, że użytkownik ma dostęp wyłącznie do swoich danych.

### 7. Obsługa błędów
- **Błędne dane wejściowe (400)**: Zwracane w przypadku niepoprawnych parametrów zapytania.
- **Brak uwierzytelnienia (401)**: Obsługiwane przez middleware.
- **Błąd bazy danych (500)**: Błąd jest logowany po stronie serwera, a klient otrzymuje generyczną odpowiedź `500`.

### 8. Rozważania dotyczące wydajności
- **Indeksowanie**: Kolumna `user_id` w tabeli `flashcards` musi być zaindeksowana w celu przyspieszenia zapytań.
- **Limit wyników**: Należy nałożyć sztywny limit (np. 100) na parametr `limit`, aby zapobiec nadużyciom.

### 9. Etapy wdrożenia
1.  Dodać w `src/pages/api/flashcards.ts` handler dla metody `GET`.
2.  Zdefiniować schemat Zod do walidacji parametrów zapytania.
3.  Rozszerzyć `FlashcardService` w `src/lib/services/flashcard.service.ts` o nową metodę `getFlashcards`.
4.  W metodzie `getFlashcards` zaimplementować logikę pobierania danych z Supabase, uwzględniając paginację (`.range()`) i sortowanie (`.order()`).
5.  Zintegrować handler `GET` z `FlashcardService` i zaimplementować zwracanie odpowiedzi.

---

## API Endpoint Implementation Plan: `PUT /flashcards/{id}`

### 1. Przegląd punktu końcowego
Ten punkt końcowy służy do aktualizacji istniejącej fiszki na podstawie jej ID.

### 2. Szczegóły żądania
- **Metoda HTTP**: `PUT`
- **Struktura URL**: `/api/flashcards/[id]`
- **Parametr Ścieżki (Path Parameter)**:
  - `id` (wymagany, `number`): ID fiszki do aktualizacji.
- **Ciało Żądania (Request Body)**: Obiekt JSON z polami do aktualizacji.
  ```json
  {
    "front": "Zaktualizowany tekst awersu",
    "back": "Zaktualizowany tekst rewersu",
    "source": "ai-edited"
  }
  ```

### 3. Wykorzystywane typy
- **`FlashcardUpdateDto`**: Reprezentuje ciało żądania.

### 4. Szczegóły odpowiedzi
- **Odpowiedź sukcesu (204 No Content)**: Zwracana po pomyślnej aktualizacji. Brak ciała odpowiedzi.
- **Odpowiedzi błędów**:
  - `400 Bad Request`: Błąd walidacji ID lub ciała żądania.
  - `401 Unauthorized`: Użytkownik nie jest uwierzytelniony.
  - `404 Not Found`: Fiszka o podanym ID nie istnieje lub nie należy do użytkownika.
  - `500 Internal Server Error`: Błąd po stronie serwera.

### 5. Przepływ danych
1.  **Odbiór żądania**: Serwer odbiera żądanie `PUT` na `/api/flashcards/[id]`.
2.  **Uwierzytelnienie i walidacja ID**: Middleware sprawdza sesję. Handler waliduje, czy `id` jest poprawną liczbą.
3.  **Walidacja ciała żądania**: Handler waliduje ciało żądania przy użyciu schematu Zod (długość pól, dozwolone wartości `source`).
4.  **Wywołanie serwisu**: Handler wywołuje metodę `updateFlashcard` z `FlashcardService`, przekazując `user_id`, `flashcard_id` oraz zwalidowane dane.
5.  **Operacja na bazie danych**: Serwis wykonuje operację `update` w Supabase, używając `.match({ id: flashcard_id, user_id: user_id })` do zapewnienia, że użytkownik modyfikuje tylko własną fiszkę.
6.  **Obsługa wyniku**: Jeśli operacja nie zaktualizowała żadnego wiersza, serwis rzuca błąd `NotFound`.
7.  **Zwrócenie odpowiedzi**: W przypadku sukcesu handler zwraca `204 No Content`.

### 6. Względy bezpieczeństwa
- **Autoryzacja**: Kluczowe jest użycie `user_id` w klauzuli `match` zapytania `update`, aby uniemożliwić edycję cudzych danych. RLS stanowi dodatkową warstwę ochrony.
- **Walidacja danych**: Walidacja `source` zapobiega ustawieniu nieprawidłowej wartości (np. `ai-full` podczas edycji).

### 7. Obsługa błędów
- **Nieznaleziony zasób (404)**: Zwracany, gdy operacja `update` nie powiedzie się z powodu braku pasującego rekordu.
- **Błędne dane (400)**: Zwracane przy niepoprawnym `id` lub błędach w ciele żądania.

### 8. Etapy wdrożenia
1.  Utworzyć plik `src/pages/api/flashcards/[id].ts`.
2.  W pliku `[id].ts` zaimplementować handler dla metody `PUT`.
3.  Zdefiniować schemat Zod dla `FlashcardUpdateDto` i walidacji ciała żądania.
4.  Rozszerzyć `FlashcardService` o metodę `updateFlashcard`.
5.  Zaimplementować logikę aktualizacji w serwisie, obsługując przypadek `NotFound`.
6.  Połączyć handler `PUT` z serwisem i zaimplementować obsługę błędów oraz sukcesu.

---

## API Endpoint Implementation Plan: `DELETE /flashcards/{id}`

### 1. Przegląd punktu końcowego
Ten punkt końcowy pozwala na usunięcie fiszki o określonym ID.

### 2. Szczegóły żądania
- **Metoda HTTP**: `DELETE`
- **Struktura URL**: `/api/flashcards/[id]`
- **Parametr Ścieżki (Path Parameter)**:
  - `id` (wymagany, `number`): ID fiszki do usunięcia.

### 3. Szczegóły odpowiedzi
- **Odpowiedź sukcesu (204 No Content)**: Zwracana po pomyślnym usunięciu.
- **Odpowiedzi błędów**:
  - `400 Bad Request`: Nieprawidłowy format ID.
  - `401 Unauthorized`: Brak uwierzytelnienia.
  - `404 Not Found`: Fiszka o podanym ID nie istnieje lub nie należy do użytkownika.
  - `500 Internal Server Error`: Błąd serwera.

### 4. Przepływ danych
1.  **Odbiór żądania**: Serwer odbiera żądanie `DELETE` na `/api/flashcards/[id]`.
2.  **Uwierzytelnienie i walidacja ID**: Middleware sprawdza sesję, a handler waliduje `id`.
3.  **Wywołanie serwisu**: Handler wywołuje metodę `deleteFlashcard` z `FlashcardService`, przekazując `user_id` i `flashcard_id`.
4.  **Operacja na bazie danych**: Serwis wykonuje operację `delete` w Supabase, używając `.match({ id: flashcard_id, user_id: user_id })`.
5.  **Obsługa wyniku**: Jeśli operacja nie usunęła żadnego wiersza, serwis rzuca błąd `NotFound`.
6.  **Zwrócenie odpowiedzi**: W przypadku sukcesu handler zwraca `204 No Content`.

### 5. Względy bezpieczeństwa
- **Autoryzacja**: Użycie `user_id` w zapytaniu `delete` oraz polityki RLS są kluczowe, aby uniemożliwić usuwanie cudzych danych.

### 6. Obsługa błędów
- **Nieznaleziony zasób (404)**: Zwracany, gdy próba usunięcia nie powiedzie się, ponieważ rekord nie istnieje lub nie należy do użytkownika.

### 7. Etapy wdrożenia
1.  W pliku `src/pages/api/flashcards/[id].ts` dodać handler dla metody `DELETE`.
2.  Zaimplementować walidację parametru `id`.
3.  Rozszerzyć `FlashcardService` o metodę `deleteFlashcard`.
4.  W metodzie `deleteFlashcard` zaimplementować logikę usuwania rekordu z Supabase.
5.  Zintegrować handler `DELETE` z serwisem, dodając obsługę błędów i odpowiedzi.
