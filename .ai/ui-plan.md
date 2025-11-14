# Architektura UI dla AI Flashcard Generator

## 1. Przegląd struktury UI

Interfejsu użytkownika (UI) dla AI Flashcard Generator jest zbudowana wokół widoku generowania fiszerk dostępnego po autoryzacji. Całość korzysta z responsywnego designu opartego na Tailwind, gotowych komponentów z Shadcn/ui oraz React.

Struktura opiera się na trzech głównych widokach (stronach) oraz kilku kluczowych komponentach modalnych, które obsługują podstawowe operacje CRUD (tworzenie, odczyt, aktualizacja, usuwanie) na fiszkach. Centralnym punktem aplikacji jest panel główny (Dashboard), który stanowi centrum zarządzania fiszkami. Dedykowane strony do generowania i recenzji fiszek zapewniają płynny i logiczny przepływ pracy użytkownika.

Do zarządzania stanem serwera zostanie wykorzystana biblioteka TanStack Query (React Query), co zapewni efektywne pobieranie danych, cachowanie oraz automatyczną aktualizację interfejsu w odpowiedzi na działania użytkownika. Architektura kładzie nacisk na responsywność interakcji poprzez mechanizmy "optimistic UI updates" oraz klarowną komunikację stanu aplikacji (ładowanie, błędy) za pomocą wskaźników wizualnych i globalnego systemu powiadomień.

## 2. Lista widoków

### Widok 1: Ekran uwierzytelniania
- **Nazwa widoku**: Authorization
- **Ścieżka widoku**: `/login` i `/register`
- **Główny cel**: Umożliwienie użytkownikowi logowania oraz rejestracji
- **Kluczowe informacje do wyświetlenia**:
    - Formularze z polami email i hasło
- **Kluczowe komponenty widoku**:
    - Formularz lgoowania/rejestracji, komponent walidacji, przyciski
- **UX, dostępność i względy bezpieczeństwa**:
    - Prosty formularz, czytelne komunikaty błedów, zabezpieczenia JWT

### Widok 2: Panel Główny (Dashboard)
- **Nazwa widoku**: Dashboard View
- **Ścieżka widoku**: `/dashboard`
- **Główny cel**: Umożliwienie użytkownikowi przeglądania, wyszukiwania i zarządzania swoimi fiszkami. Stanowi punkt wyjścia do tworzenia nowych fiszek (zarówno manualnie, jak i za pomocą AI).
- **Kluczowe informacje do wyświetlenia**:
    - Tabela z listą fiszek użytkownika.
    - Kontrolki do paginacji i sortowania listy.
    - Informacja o całkowitej liczbie fiszek.
- **Kluczowe komponenty widoku**:
    - `FlashcardsDataTable`: Tabela wyświetlająca fiszki z opcjami sortowania i menu akcji (edycja, usunięcie) dla każdego wiersza.
    - `PaginationControls`: Komponent do nawigacji między stronami listy fiszek.
    - Przyciski akcji: "Wygeneruj fiszki AI", "Utwórz fiszkę manualnie".
- **UX, dostępność i względy bezpieczeństwa**:
    - W przypadku braku fiszek, wyświetlany jest stan pusty z zachętą do działania.
    - Tabela i jej kontrolki powinny być dostępne z klawiatury (zgodność z WAI-ARIA).
    - Dostęp do widoku jest chroniony i wymaga zalogowanego użytkownika.

### Widok 3: Generator FIszek (AI)
- **Nazwa widoku**: Generation View
- **Ścieżka widoku**: `/generate`
- **Główny cel**: Umożliwienie użytkownikowi wklejenia tekstu źródłowego i zainicjowania procesu generowania propozycji fiszek przez AI.
- **Kluczowe informacje do wyświetlenia**:
    - Pole tekstowe na materiał źródłowy.
    - Informacje o wymaganiach dotyczących długości tekstu (np. licznik znaków).
- **Kluczowe komponenty widoku**:
    - `Textarea` z walidacją po stronie klienta.
    - Przycisk "Generuj" z obsługą stanu ładowania (spinner, stan `disabled`).
- **UX, dostępność i względy bezpieczeństwa**:
    - Jasne komunikaty walidacyjne informują użytkownika o niespełnieniu wymagań co do długości tekstu.
    - Wszelkie błędy API podczas generowania są komunikowane za pomocą powiadomień "toast".

### Widok 4: Recenzja FIszek
- **Nazwa widoku**: Review View
- **Ścieżka widoku**: `/flashcards`
- **Główny cel**: Umożliwienie użytkownikowi przejrzenia, edycji, akceptacji lub odrzucenia propozycji fiszek wygenerowanych przez AI przed ich finalnym zapisaniem.
- **Kluczowe informacje do wyświetlenia**:
    - Lista propozycji fiszek.
    - Licznik zaakceptowanych fiszek.
- **Kluczowe komponenty widoku**:
    - `FlashcardProposalCard`: Komponent karty dla każdej propozycji, zawierający jej treść oraz przyciski akcji (Akceptuj, Edytuj, Odrzuć).
    - Przycisk "Zapisz X fiszek" (gdzie X to liczba zaakceptowanych), który finalizuje proces i obsługuje stan ładowania.
- **UX, dostępność i względy bezpieczeństwa**:
    - Użytkownik ma pełną kontrolę nad tym, które fiszki zostaną zapisane.
    - Przekazanie danych z widoku `/generate` odbywa się po stronie klienta (np. za pomocą lekkiej biblioteki do zarządzania stanem jak Zustand), aby uniknąć przeładowania URL.

## 3. Mapa podróży użytkownika

Główny przepływ pracy (generowanie fiszek AI) wygląda następująco:
1. Użytkownik uzyskuje dostęp do aplikacji i trafia do ekranu logowania
1.  **Start (Dashboard)**: Użytkownik znajduje się na `/dashbaord`. Klika "Wygeneruj fiszki AI".
2.  **Generowanie (Generate)**: Zostaje przekierowany na `/generate`. Wkleja tekst i klika "Generuj".
3.  **Przekazanie danych**: Po pomyślnej odpowiedzi z API, lista propozycji jest zapisywana w stanie klienta.
4.  **Recenzja (Review)**: Użytkownik jest automatycznie przekierowywany na `/review`, gdzie przegląda i modyfikuje propozycje.
5.  **Finalizacja**: Klika "Zapisz X fiszek". Aplikacja wysyła finalną listę do API.
6.  **Powrót i potwierdzenie (Dashboard)**: Po sukcesie, użytkownik wraca na `/`, gdzie widzi powiadomienie "toast" o powodzeniu, a nowo dodane fiszki pojawiają się na liście dzięki automatycznemu odświeżeniu danych przez TanStack Query.

Inne przepływy:
- **Tworzenie manualne**: `/` -> Klik "Utwórz fiszkę manualnie" -> `Flashcard Form Modal` -> Zapis -> Modal się zamyka, lista na `/` odświeża się.
- **Edycja**: `/` -> Menu akcji w tabeli -> Klik "Edytuj" -> `Flashcard Form Modal` z danymi fiszki -> Zapis -> Modal się zamyka, lista na `/` odświeża się.
- **Usuwanie**: `/` -> Menu akcji w tabeli -> Klik "Usuń" -> `Delete Confirmation Modal` -> Potwierdzenie -> Fiszka znika z listy na `/`.

## 4. Układ i struktura nawigacji

- **Główny układ**: Aplikacja posiada stały, globalny pasek nawigacyjny (Top Bar) na górze strony, który jest widoczny we wszystkich głównych widokach. Poniżej paska renderowana jest treść właściwa dla danej strony.
- **Pasek nawigacyjny (Top Bar)**: Zawiera:
    - Logo aplikacji (linkujące do `/`).
    - Link do "Panelu Głównego" (`/dashboard`).
    - Link do "Generatora FIszek" (`/generate`).
    - Menu użytkownika (UserNav) z opcjami takimi jak "Profil" i "Wyloguj".

Nawigacja między głównymi sekcjami odbywa się poprzez kliknięcie linków w Top Barze, natomiast kluczowe akcje w przepływach (np. generowanie, zapis) powodują programowe przekierowanie użytkownika do kolejnych kroków.

## 5. Kluczowe komponenty

Poniżej znajduje się lista kluczowych, reużywalnych komponentów, które będą stanowić budulec interfejsu:
- **`FlashcardsDataTable`**: Reużywalna tabela danych (oparta na `shadcn/ui` DataTable) skonfigurowana do wyświetlania fiszek. Obsługuje sortowanie po stronie klienta (przekazując parametry do API) oraz zawiera logikę dla menu akcji.
- **`FlashcardForm`**: Formularz do tworzenia i edycji fiszki, zawierający logikę walidacji. Używany wewnątrz `Flashcard Form Modal`.
- **`TopBar`**: Globalny komponent nawigacyjny.
- **`Toast`**: Globalny system powiadomień do informowania użytkownika o sukcesach, błędach i innych ważnych zdarzeniach.
- **`LoaderButton`**: Przycisk, który może wyświetlać wskaźnik ładowania i blokować się podczas operacji asynchronicznych.
- **`PageHeader`**: Standardowy komponent nagłówka strony, używany w każdym widoku do wyświetlania tytułu i opcjonalnie przycisków akcji.
