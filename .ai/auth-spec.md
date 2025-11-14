# Specyfikacja Techniczna Modułu Autentykacji

## 1. Architektura Interfejsu Użytkownika

### A. Nowe Strony (Pages)

-   **/login** (Logowanie): Strona Astro (`src/pages/login.astro`), która będzie renderować komponent React `LoginForm`. Będzie on odpowiedzialny za:
    -   Zarządzanie stanem formularza.
    -   Walidację po stronie klienta (np. czy email jest w poprawnym formacie).
    -   Wysyłanie danych do endpointu API `/api/auth/login`.
    -   Wyświetlanie komunikatów o błędach (np. "Nieprawidłowy email lub hasło").
    -   Obsługę stanu ładowania podczas komunikacji z API.

-   **/register** (Rejestracja): Strona Astro (`src/pages/register.astro`), która będzie renderować komponent React `RegisterForm`. Będzie on odpowiedzialny za:
    -   Zarządzanie stanem formularza.
    -   Walidację po stronie klienta (np. siła hasła, zgodność haseł).
    -   Wysyłanie danych do endpointu API `/api/auth/register`.
    -   Wyświetlanie komunikatów o sukcesie (np. "Sprawdź email, aby potwierdzić rejestrację") i błędach.

-   **/password-recovery** (Odzyskiwanie hasła): Strona Astro (`src/pages/password-recovery.astro`), która będzie renderować komponent React `PasswordRecoveryForm`. Będzie on odpowiedzialny za:
    -   Wysyłanie prośby o reset hasła do `/api/auth/password-recovery`.
    -   Informowanie użytkownika o wysłaniu linku do resetu hasła.

-   **/dashboard** (Panel główny po zalogowaniu): Strona Astro (`src/pages/dashboard.astro`), która będzie dostępna tylko dla zalogowanych użytkowników. Na początek będzie przekierowywać do strony generowania fiszek.

### B. Nowe Komponenty (Components)

-   **`LoginForm.tsx`**: Komponent React (`src/components/LoginForm.tsx`) zawierający formularz logowania (email, hasło). Będzie on odpowiedzialny za:
    -   Zarządzanie stanem formularza.
    -   Walidację po stronie klienta (np. czy email jest w poprawnym formacie).
    -   Wysyłanie danych do endpointu API `/api/auth/login`.
    -   Wyświetlanie komunikatów o błędach (np. "Nieprawidłowy email lub hasło").
    -   Obsługę stanu ładowania podczas komunikacji z API.

-   **`RegisterForm.tsx`**: Komponent React (`src/components/RegisterForm.tsx`) z formularzem rejestracji (email, hasło, powtórz hasło). Będzie on odpowiedzialny za:
    -   Zarządzanie stanem formularza.
    -   Walidację po stronie klienta (np. siła hasła, zgodność haseł).
    -   Wysyłanie danych do endpointu API `/api/auth/register`.
    -   Wyświetlanie komunikatów o sukcesie (np. "Sprawdź email, aby potwierdzić rejestrację") i błędach.

-   **`PasswordRecoveryForm.tsx`**: Komponent React (`src/components/PasswordRecoveryForm.tsx`) z formularzem do odzyskiwania hasła (email). Będzie odpowiedzialny za:
    -   Wysyłanie prośby o reset hasła do `/api/auth/password-recovery`.
    -   Informowanie użytkownika o wysłaniu linku do resetu hasła.

-   **`AuthLayout.astro`**: Layout (`src/layouts/AuthLayout.astro`) dla stron niezalogowanego użytkownika (`/login`, `/register`). Będzie zawierał podstawową strukturę strony.
-   **`DashboardLayout.astro`**: Layout (`src/layouts/DashboardLayout.astro`) dla stron zalogowanego użytkownika. Będzie zawierał nawigację, przycisk do wylogowania i będzie chroniony przez middleware.
-   **`UserDropdown.tsx`**: Komponent React (`src/components/UserDropdown.tsx`) w `DashboardLayout.astro` wyświetlający menu użytkownika z opcją wylogowania.

### C. Rozdzielenie odpowiedzialności i integracja

-   **Strony Astro (`.astro`)** będą służyć jako punkty wejścia i kontenery dla komponentów React. Będą odpowiedzialne za routing i renderowanie odpowiednich layoutów.
-   **Komponenty React (`.tsx`)** będą zarządzać całą logiką interaktywną formularzy, stanem i komunikacją z API po stronie klienta. Użyjemy atrybutu `client:load` w Astro, aby komponenty były interaktywne od razu po załadowaniu strony.

### D. Scenariusze i walidacja

-   **Rejestracja**:
    -   Walidacja email (format).
    -   Walidacja hasła (minimalna długość, np. 8 znaków).
    -   Sprawdzenie, czy hasła się zgadzają.
    -   Komunikat błędu, jeśli użytkownik o danym emailu już istnieje.
    -   Po pomyślnej rejestracji użytkownik jest informowany o konieczności potwierdzenia adresu email w celu uzyskania pełnego dostępu.
-   **Logowanie**:
    -   Walidacja email (format).
    -   Komunikat o błędnych danych logowania.
-   **Nawigacja**:
    -   Użytkownik niezalogowany, próbujący wejść na `/dashboard`, zostanie przekierowany na `/login`.
    -   Użytkownik zalogowany, próbujący wejść na `/login` lub `/register`, zostanie przekierowany na `/dashboard`.

## 2. Logika Backendowa

### A. Endpointy API

Stworzymy endpointy w katalogu `src/pages/api/auth/`:

-   **`POST /api/auth/register`**:
    -   Przyjmuje: `email`, `password`.
    -   Waliduje dane wejściowe.
    -   Wykorzystuje Supabase SDK do rejestracji nowego użytkownika. Supabase automatycznie wyśle email weryfikacyjny, a użytkownik zostanie wstępnie zalogowany.
    -   Sesja użytkownika do czasu potwierdzenia emaila będzie posiadać status niezweryfikowany, co może ograniczać dostęp do niektórych funkcji.
    -   Zwraca: Sukces lub błąd (np. użytkownik już istnieje).

-   **`POST /api/auth/login`**:
    -   Przyjmuje: `email`, `password`.
    -   Waliduje dane.
    -   Loguje użytkownika za pomocą Supabase SDK.
    -   W odpowiedzi ustawia ciasteczka sesji (`access_token`, `refresh_token`), które będą używane przez middleware i po stronie klienta.

-   **`POST /api/auth/logout`**:
    -   Wylogowuje użytkownika, unieważniając sesję w Supabase.
    -   Usuwa ciasteczka sesji.

-   **`POST /api/auth/password-recovery`**:
    -   Przyjmuje: `email`.
    -   Wywołuje funkcję resetowania hasła w Supabase, która wyśle email z linkiem do resetu.

-   **`POST /api/auth/delete-account`**:
    -   Dostępny tylko dla zalogowanego użytkownika.
    -   Usuwa konto użytkownika oraz wszystkie powiązane z nim dane (np. fiszki) z bazy danych.
    -   Operacja wymagać będzie dodatkowego potwierdzenia od użytkownika po stronie klienta.
    -   Wylogowuje użytkownika i usuwa ciasteczka sesji.

### B. Walidacja i obsługa błędów

-   Do walidacji danych wejściowych po stronie serwera użyjemy biblioteki `zod`.
-   Każdy endpoint API będzie opakowany w blok `try...catch` do obsługi błędów z Supabase lub innych nieoczekiwanych problemów.
-   Błędy będą zwracane z odpowiednimi kodami statusu HTTP (np. 400 dla błędnych danych, 401 dla nieautoryzowanego dostępu, 500 dla błędów serwera).

### C. Renderowanie Server-Side

-   `astro.config.mjs` zostanie skonfigurowany z `output: 'server'`, aby umożliwić renderowanie po stronie serwera i działanie middleware.
-   Stworzymy middleware w `src/middleware/index.ts`. Będzie on:
    -   Odczytywał ciasteczka sesji przy każdym żądaniu.
    -   Weryfikował token sesji przy użyciu Supabase SDK.
    -   Jeśli sesja jest ważna, zapisywał dane użytkownika w `Astro.locals`, aby były dostępne w komponentach Astro.
    -   Przekierowywał użytkowników na podstawie ich statusu zalogowania i strony, do której próbują uzyskać dostęp (ochrona tras).

## 3. System Autentykacji (Supabase Auth)

-   **Konfiguracja**: Skonfigurujemy klienta Supabase w `src/db/supabase.client.ts`, aby był dostępny zarówno po stronie serwera (w middleware i API), jak i klienta (w komponentach React). Użyjemy zmiennych środowiskowych do przechowywania kluczy Supabase.
-   **Rejestracja**: Wykorzystamy `supabase.auth.signUp()`. Skonfigurujemy Supabase, aby wymagał potwierdzenia email.
-   **Logowanie**: Użyjemy `supabase.auth.signInWithPassword()`. Sesja będzie zarządzana przez Supabase za pomocą ciasteczek.
-   **Wylogowywanie**: `supabase.auth.signOut()`.
-   **Zarządzanie sesją**: Middleware będzie używać `supabase.auth.getUser()` do pobrania informacji o zalogowanym użytkowniku na podstawie ciasteczek z żądania. To zapewni, że stan sesji jest zawsze aktualny.
-   **Odzyskiwanie hasła**: `supabase.auth.resetPasswordForEmail()`. Supabase zajmie się wysłaniem emaila i obsługą linku do resetowania. Po kliknięciu w link, użytkownik zostanie przekierowany na stronę w naszej aplikacji, gdzie będzie mógł ustawić nowe hasło (ta strona będzie musiała obsłużyć token z URL).

## 4. Autoryzacja i Bezpieczeństwo Danych

### A. Ochrona Tras (Route Guarding)
-   Middleware (`src/middleware/index.ts`) będzie głównym mechanizmem chroniącym trasy.
-   Strony w `DashboardLayout.astro` będą dostępne tylko dla uwierzytelnionych użytkowników.
-   Użytkownicy z niepotwierdzonym adresem e-mail mogą mieć ograniczony dostęp, co zostanie zaimplementowane w middleware poprzez sprawdzanie statusu użytkownika w `Astro.locals`.

### B. Dostęp do Danych (Data Access)
-   Zgodnie z historyjką użytkownika **US-009**, każdy użytkownik ma dostęp wyłącznie do swoich danych.
-   Aby to zapewnić, zostanie włączony mechanizm **Row Level Security (RLS)** w Supabase dla tabel przechowujących dane użytkowników (np. fiszki).
-   Polityki RLS będą skonfigurowane tak, aby operacje `SELECT`, `INSERT`, `UPDATE`, `DELETE` były dozwolone tylko wtedy, gdy `user_id` w rekordzie pasuje do ID uwierzytelnionego użytkownika wysyłającego żądanie.
-   Wszystkie endpointy API operujące na danych (np. `POST /api/flashcards`) będą polegać na sesji użytkownika zweryfikowanej przez middleware i politykach RLS w bazie danych, co zapewni, że operacje są wykonywane w kontekście właściwego użytkownika.
