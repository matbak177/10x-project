# API Endpoint Implementation Plan: POST /generations

## 1. Przegląd punktu końcowego
Ten punkt końcowy inicjuje proces generowania propozycji fiszek na podstawie tekstu dostarczonego przez użytkownika. Wykorzystuje zewnętrzną usługę AI do analizy tekstu i tworzenia par pytanie-odpowiedź. Po pomyślnym zakończeniu operacji, zapisuje metadane w bazie danych i zwraca wygenerowane propozycje do klienta.

## 2. Szczegóły żądania
- **Metoda HTTP:** `POST`
- **Struktura URL:** `/generations`
- **Request Body:** Ciało żądania musi zawierać obiekt JSON z jednym polem.
  - **Struktura:**
    ```json
    {
      "source_text": "A long block of text about a specific topic, between 1000 and 10000 characters..."
    }
    ```
- **Walidacja:**
  - `source_text`: Wymagany, `string`, `min: 1000`, `max: 10000`.

## 3. Wykorzystywane typy


- **GenerateFlashcardsCommand**: Model wejsciowy zawierający pole `source_text`
- **GenerationCreateResponseDto**: Model odpowiedzi zawierający:
  - `generation_id` (number)
  - `flashcards_proposals` (tablica obiektow typu FlashcardProposalDto)
  - `generated_count` (number)
- **FlashcardProposalDto**: Pojedyncza proopzycja fiszki z polami:
  - `front` (string)
  - `back` (string)
  - `source` - wartość stała: `ai-full`

## 4. Szczegóły odpowiedzi
- **Odpowiedź sukcesu (200 OK):** Zwraca obiekt zawierający ID sesji generowania, listę propozycji fiszek oraz liczbę wygenerowanych kart.
  ```json
  {
    "generation_id": 123,
    "flashcards_proposals": [
      {
        "front": "Suggested question 1?",
        "back": "Suggested answer 1.",
        "source": "ai-full"
      },
      {
        "front": "Suggested question 2?",
        "back": "Suggested answer 2.",
        "source": "ai-full"
      }
    ],
    "generated_count": 2
  }
  ```
- **Odpowiedzi błędów:**
  - `400 Bad Request`: Błąd walidacji danych wejściowych.
  - `401 Unauthorized`: Użytkownik nie jest uwierzytelniony.
  - `502 Bad Gateway`: Błąd komunikacji z zewnętrzną usługą AI.
  - `500 Internal Server Error`: Wewnętrzny błąd serwera.

## 5. Przepływ danych
1.  **Odbiór żądania:**: POST z całiem zawierającym `source_text`
2.  **Walidacja:** Walidacja danych wejściowych za pomocą biblioteki `zod`, sprwadzajace, że długość `source_text` wynosi od 1000 do 10000 znkaów.
3.  **Wywołanie serwisu:** Wywowałanie dedykowanego serwisu (np. `GenerationService`), który:
  - Przekazuje `source_text` do zewnętrzengo serwisu AI w celu wygenerowania propozycji fiszek
  - Oblicza i zapisuje metadane generacji w tabeli `generations` (m.in. `model`, `generated_count`, `source_text_hash`, `source_text_lenght`, `generation_duration`).
4. W Przypadku wystąpienia błędu podczas wywołania AI, rejestrowanie błędu w tabeli `generation_error_logs` z odpowiedziami danymi (np. `error_code`, `error_message`, `model`)
5. Zwrócenie odpowiedzi do klienta z danymi zgodnymmi z modelem `GenerationCreateResponseDto`


## 6. Względy bezpieczeństwa
- **Uwierzytelnienie i Autoryzacja:** Endpoint powinien być zabezpieczony przy użyciu Supabase Auth. Upewnij się, że tylko  autoryzowani uzytkownicy mogą inicjować generacje.
- **Walidacja danych:** Użycie Zod do ścisłej walidacji `source_text` chroni przed nieprawidłowymi danymi i potencjalnymi atakami (np. nadmiernie długim tekstem).
- **Ograniczenie ekspozycji błędów** Szczegóły błędów nie powinny być zwracane użytkownikowi. Niepełne informacje o błedach powinny być logowane wewnętrznie

## 7. Obsługa błędów
- **Błędne dane wejściowe**: Jeżeli `source_text` nie mieści się w wymaganym zakresie długości, zwróć błąd 400 z odpowiednią wiadomością
- **Błęd serwisu AI (500)**: W przypadku awarii podczas komunikacji z serwisem AI, złap wyjątek, zaloguj błąd i zapis w tabeli generation_error_logs i zwróc błąd 500
- **Błęd bazy danych (500)**: W przypadku probleów z zapisaem do bazy danych, zwróć błąd 500 wraz z logowaniem błędu

## 8. Rozważania dotyczące wydajności
- **timeout dla wywowałania AI**: 60 sekund na czas oczekiwania, inaczej błąd timeout
- **Asynchroniczne przetwarzanie**: Rozważ możliwość przetwarzania asynchronicznego generacji

## 8. Etapy wdrożenia
1.  Utworzenie pliku endpointu w katalogu `src/pages/api`, np `generations.ts`
2.  Implementacja walidacji żądania przy użyciu `zod` (sprawdzenie długości `source_text`)
3.  Stworzenie sersiu np (`GenerationService`), który:
  - Integruje się z zewnętrznym serwisem AI. Na tym etapie developmentu skorzystamy z mocków zamiast wywowałnia serwisu AI.
  - Obsługuje logikę zapisu do tabeli ` generations` oraz rejestacji błędów w `generation_error_logs`
4.  Dodanie mechanizmy uwierzytelnienia poprzez Supabase Auth.
5   Implementacja logiki endpointu, wykorzystującej utworozny serwis
6.  Ddodanie szczeógłowego logowania akcji i błędów.
