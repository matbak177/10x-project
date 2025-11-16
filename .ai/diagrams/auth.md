<authentication_analysis>

### 1. Przepływy autentykacji

- **Rejestracja**: Nowy użytkownik tworzy konto za pomocą adresu e-mail i hasła.
- **Logowanie**: Zarejestrowany użytkownik loguje się do systemu.
- **Wylogowanie**: Zalogowany użytkownik kończy swoją sesję.
- **Odzyskiwanie hasła**: Użytkownik prosi o zresetowanie hasła.
- **Dostęp do chronionej trasy**: Zalogowany użytkownik próbuje uzyskać dostęp do strony chronionej, takiej jak `/dashboard`.
- **Przekierowanie przy braku autentykacji**: Niezalogowany użytkownik jest przekierowywany ze strony chronionej na stronę logowania.
- **Przekierowanie po autentykacji**: Zalogowany użytkownik, próbując uzyskać dostęp do `/login` lub `/register`, jest przekierowywany do `/dashboard`.

### 2. Główni aktorzy i ich interakcje

- **Użytkownik**: Interakcja z przeglądarką.
- **Przeglądarka (Komponenty React)**: Renderuje interfejs użytkownika (`LoginForm`, `RegisterForm`), przechwytuje dane wejściowe i wykonuje wywołania API do backendu Astro.
- **Strony Astro**: Służą jako host dla komponentów React.
- **Middleware Astro**: Przechwytuje wszystkie żądania, sprawdza ciasteczka sesji, weryfikuje sesję w Supabase i przekierowuje użytkowników na podstawie ich statusu uwierzytelnienia. Zarządza `Astro.locals.user`.
- **Astro API (`/api/auth/*`)**: Obsługuje logikę biznesową operacji autentykacji (rejestracja, logowanie, wylogowanie), komunikuje się z Supabase Auth oraz ustawia/usuwa ciasteczka sesji.
- **Supabase Auth**: Dostawca tożsamości. Zarządza użytkownikami, sesjami i wysyła e-maile (weryfikacyjne, resetowanie hasła).

### 3. Procesy weryfikacji i odświeżania tokenów

- **Middleware Astro** jest centralnym punktem weryfikacji tokenów. Przy każdym żądaniu do chronionej trasy odczytuje ciasteczka sesji (`access_token`, `refresh_token`).
- Używa **Supabase SDK (`supabase.auth.getUser()`)** do weryfikacji ważności tokena.
- **Supabase SDK** automatycznie obsługuje mechanizm odświeżania tokenów. Gdy `access_token` wygaśnie, a `refresh_token` jest ważny, SDK odświeża token i zwraca nową sesję. Middleware otrzymuje zaktualizowane dane użytkownika, a nowe tokeny są przesyłane z powrotem do przeglądarki w formie ciasteczek.

### 4. Opis kroków autentykacji

1.  **Rejestracja**:
    - Użytkownik wypełnia formularz `RegisterForm.tsx`.
    - Komponent wywołuje `POST /api/auth/register`.
    - Endpoint API wywołuje `supabase.auth.signUp()`.
    - Supabase tworzy użytkownika, wysyła e-mail weryfikacyjny i tworzy sesję.
    - API ustawia ciasteczka sesji w odpowiedzi.
    - Użytkownik jest informowany o konieczności sprawdzenia poczty e-mail.

2.  **Logowanie**:
    - Użytkownik wypełnia formularz `LoginForm.tsx`.
    - Komponent wywołuje `POST /api/auth/login`.
    - Endpoint API wywołuje `supabase.auth.signInWithPassword()`.
    - Supabase weryfikuje dane uwierzytelniające i zwraca sesję.
    - API ustawia ciasteczka sesji.
    - Użytkownik jest przekierowywany do `/dashboard`.

3.  **Dostęp do chronionej trasy (`/dashboard`)**:
    - Użytkownik przechodzi do `/dashboard`.
    - **Middleware Astro** przechwytuje żądanie.
    - Middleware odczytuje ciasteczka sesji.
    - Wywołuje `supabase.auth.getUser()` z tokenem z ciasteczek.
    - **Jeśli sesja jest ważna**: Supabase zwraca dane użytkownika. Middleware zapisuje użytkownika w `Astro.locals.user` i pozwala na kontynuację żądania.
    - **Jeśli sesja jest nieważna/brakująca**: Middleware przekierowuje użytkownika do `/login`.

4.  **Wylogowanie**: - Użytkownik klika "Wyloguj" w `UserDropdown.tsx`. - Komponent wywołuje `POST /api/auth/logout`. - Endpoint API wywołuje `supabase.auth.signOut()`. - Supabase unieważnia sesję. - API usuwa ciasteczka sesji. - Użytkownik jest przekierowywany do `/login`.
    </authentication_analysis>

<mermaid_diagram>

```mermaid
sequenceDiagram
    autonumber
    participant Użytkownik
    participant Przeglądarka (React)
    participant Middleware Astro
    participant Astro API
    participant Supabase Auth

    Użytkownik->>Przeglądarka (React): Wprowadza dane w formularzu logowania
    activate Przeglądarka (React)
    Przeglądarka (React)->>Astro API: POST /api/auth/login (email, hasło)
    deactivate Przeglądarka (React)

    activate Astro API
    Astro API->>Supabase Auth: signInWithPassword(email, hasło)
    activate Supabase Auth
    Supabase Auth-->>Astro API: Zwraca sesję (access_token, refresh_token)
    deactivate Supabase Auth

    Astro API-->>Przeglądarka (React): Odpowiedź 200 OK, ustawia ciasteczka sesji
    deactivate Astro API

    activate Przeglądarka (React)
    Przeglądarka (React)->>Użytkownik: Przekierowanie na /dashboard
    deactivate Przeglądarka (React)

    Użytkownik->>Przeglądarka (React): Żądanie dostępu do /dashboard

    activate Przeglądarka (React)
    Przeglądarka (React)->>Middleware Astro: GET /dashboard (z ciasteczkami)
    deactivate Przeglądarka (React)

    activate Middleware Astro
    Middleware Astro->>Supabase Auth: getUser(access_token)
    activate Supabase Auth

    alt Token jest ważny
        Supabase Auth-->>Middleware Astro: Zwraca dane użytkownika
        deactivate Supabase Auth
        Middleware Astro->>Middleware Astro: Zapisuje użytkownika w Astro.locals
        Middleware Astro-->>Przeglądarka (React): Zezwala na dostęp, renderuje stronę
    else Token wygasł, ale refresh_token jest ważny
        Supabase Auth-->>Middleware Astro: Odświeża sesję, zwraca nowe tokeny
        deactivate Supabase Auth
        Middleware Astro-->>Przeglądarka (React): Ustawia nowe ciasteczka i renderuje stronę
    else Sesja nieprawidłowa
        Supabase Auth-->>Middleware Astro: Błąd autoryzacji
        deactivate Supabase Auth
        Middleware Astro-->>Przeglądarka (React): Przekierowanie na /login
    end

    deactivate Middleware Astro
```

</mermaid_diagram>
