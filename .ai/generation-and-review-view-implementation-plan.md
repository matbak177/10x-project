# Plan implementacji widoku: Generowanie i Recenzja Fiszki

## 1. Przegląd

Celem tego widoku jest umożliwienie użytkownikom automatycznego generowania propozycji fiszek na podstawie dostarczonego tekstu, a następnie ich przeglądania, edytowania i zapisywania w swojej kolekcji. Widok łączy w sobie funkcjonalność wprowadzania danych (tekst źródłowy) oraz interaktywnej recenzji wyników (propozycje fiszek), zapewniając płynny przepływ pracy w jednym miejscu.

## 2. Routing widoku

Widok będzie dostępny pod następującą ścieżką:
- **Ścieżka**: `/generate`

## 3. Struktura komponentów

Komponenty zostaną zaimplementowane w React i osadzone na stronie Astro. Widok będzie składał się z jednego komponentu-kontenera, który zarządza stanem, oraz kilku komponentów podrzędnych odpowiedzialnych za poszczególne części interfejsu.

```
/src/pages/generate.astro
└── /src/components/views/GenerationView.tsx (komponent kliencki)
    ├── /src/components/generation/GenerationForm.tsx
    │   ├── Textarea (z Shadcn/ui)
    │   └── Button (z Shadcn/ui) - "Generuj"
    └── /src/components/generation/ReviewSection.tsx (renderowany warunkowo)
        ├── /src/components/generation/FlashcardProposalCard.tsx[]
        │   ├── Card (z Shadcn/ui)
        │   └── Button[] (z Shadcn/ui) - "Akceptuj", "Edytuj", "Odrzuć"
        ├── /src/components/generation/ReviewActions.tsx
        │   ├── Button (z Shadcn/ui) - "Akceptuj wszystkie"
        │   ├── Button (z Shadcn/ui) - "Odrzuć wszystkie"
        │   └── Button (z Shadcn/ui) - "Zapisz X fiszek"
        └── /src/components/generation/EditFlashcardDialog.tsx (renderowany warunkowo)
            ├── Dialog (z Shadcn/ui)
            └── Input[] (z Shadcn/ui)
```

## 4. Szczegóły komponentów

### `GenerationView`
- **Opis komponentu**: Główny kontener strony, który zarządza całym stanem i logiką za pomocą customowego hooka `useGenerationAndReview`. Renderuje `GenerationForm` oraz, po pomyślnym wygenerowaniu propozycji, `ReviewSection`.
- **Główne elementy**: `GenerationForm`, `ReviewSection`.
- **Obsługiwane interakcje**: Brak, deleguje logikę do hooka.
- **Obsługiwana walidacja**: Brak.
- **Typy**: Brak propsów.
- **Propsy**: Brak.

### `GenerationForm`
- **Opis komponentu**: Formularz do wprowadzania tekstu źródłowego. Zawiera pole tekstowe oraz przycisk do uruchomienia generowania.
- **Główne elementy**: `Textarea` z licznikiem znaków, `Button`.
- **Obsługiwane interakcje**: Wprowadzanie tekstu, kliknięcie przycisku "Generuj".
- **Obsługiwana walidacja**:
  - Tekst źródłowy jest wymagany.
  - Długość tekstu musi zawierać się w przedziale od 1000 do 10 000 znaków.
- **Typy**: `GenerateFlashcardsCommand`.
- **Propsy**:
  - `sourceText: string`
  - `onSourceTextChange: (text: string) => void`
  - `onGenerate: () => void`
  - `isGenerating: boolean`

### `ReviewSection`
- **Opis komponentu**: Kontener na listę wygenerowanych fiszek oraz przyciski akcji.
- **Główne elementy**: Lista komponentów `FlashcardProposalCard`, `ReviewActions`, `EditFlashcardDialog`.
- **Obsługiwane interakcje**: Deleguje zdarzenia od komponentów dzieci do `GenerationView`.
- **Obsługiwana walidacja**: Brak.
- **Typy**: `FlashcardProposalViewModel`.
- **Propsy**:
  - `proposals: FlashcardProposalViewModel[]`
  - `acceptedCount: number`
  - `isSaving: boolean`
  - `editingProposal: FlashcardProposalViewModel | null`
  - `onAccept: (id: string) => void`
  - `onReject: (id: string) => void`
  - `onEdit: (id: string) => void`
  - `onSave: () => void`
  - `onSaveEdit: (id: string, updates: { front: string, back: string }) => void`
  - `onCancelEdit: () => void`

### `FlashcardProposalCard`
- **Opis komponentu**: Karta wyświetlająca pojedynczą propozycję fiszki. Zmienia wygląd w zależności od statusu (zaakceptowana, odrzucona).
- **Główne elementy**: `Card`, `CardHeader`, `CardContent`, `CardFooter` z `Button`.
- **Obsługiwane interakcje**: Kliknięcie przycisków "Akceptuj", "Odrzuć", "Edytuj".
- **Obsługiwana walidacja**: Brak.
- **Typy**: `FlashcardProposalViewModel`.
- **Propsy**:
  - `proposal: FlashcardProposalViewModel`
  - `onAccept: (id: string) => void`
  - `onReject: (id: string) => void`
  - `onEdit: (id: string) => void`

### `EditFlashcardDialog`
- **Opis komponentu**: Modal do edycji treści fiszki.
- **Główne elementy**: `Dialog` z formularzem zawierającym `Input` dla przodu i tyłu fiszki.
- **Obsługiwane interakcje**: Wprowadzanie tekstu, zapisanie zmian, anulowanie.
- **Obsługiwana walidacja**:
  - `front`: wymagany, maksymalnie 200 znaków.
  - `back`: wymagany, maksymalnie 500 znaków.
- **Typy**: `FlashcardProposalViewModel`.
- **Propsy**:
  - `proposal: FlashcardProposalViewModel`
  - `onSave: (id: string, updates: { front: string, back: string }) => void`
  - `onCancel: () => void`

### `ReviewActions`
- **Opis komponentu**: Wyświetla liczbę zaakceptowanych fiszek i przyciski do akcji masowych, takich jak akceptacja/odrzucenie wszystkich oraz zapisanie zaakceptowanych.
- **Główne elementy**: Tekst informacyjny, `Button`y.
- **Obsługiwane interakcje**: Kliknięcie przycisku "Zapisz", "Akceptuj wszystkie", "Odrzuć wszystkie".
- **Obsługiwana walidacja**: Przycisk "Zapisz" jest nieaktywny, gdy liczba zaakceptowanych fiszek wynosi 0.
- **Propsy**:
  - `acceptedCount: number`
  - `isSaving: boolean`
  - `onSave: () => void`
  - `onAcceptAll: () => void`
  - `onRejectAll: () => void`

## 5. Typy

Do implementacji widoku potrzebny będzie jeden nowy typ ViewModel, który rozszerza DTO o stan UI.

```typescript
// Lokalizacja: src/types/view-models.ts

import type { FlashcardProposalDto } from "../types";

// Status propozycji fiszki w interfejsie użytkownika
export type ProposalStatus = "pending" | "accepted" | "rejected";

// ViewModel dla pojedynczej propozycji fiszki
export interface FlashcardProposalViewModel extends FlashcardProposalDto {
  // Unikalny identyfikator po stronie klienta (np. z crypto.randomUUID())
  id: string; 
  
  // Status propozycji (oczekująca, zaakceptowana, odrzucona)
  status: ProposalStatus;

  // Przechowuje oryginalne źródło na wypadek edycji
  // `source` z FlashcardProposalDto jest zawsze 'ai-full'
  // Ten typ pomoże nam określić, czy wysłać 'ai-full' czy 'ai-edited'
  edited: boolean;
}
```

## 6. Zarządzanie stanem

Cała logika i stan zostaną zamknięte w customowym hooku `useGenerationAndReview`, aby utrzymać komponent `GenerationView` czystym i skoncentrowanym na renderowaniu.

- **Hook**: `useGenerationAndReview`
- **Stan**:
  - `sourceText: string`: Tekst z `Textarea`.
  - `proposals: FlashcardProposalViewModel[]`: Lista propozycji.
  - `generationId: number | null`: ID z odpowiedzi API, potrzebne do zapisu.
  - `status: 'idle' | 'generating' | 'reviewing' | 'saving' | 'success' | 'error'`: Faza procesu.
  - `error: string | null`: Komunikat błędu.
  - `editingProposal: FlashcardProposalViewModel | null`: Propozycja w trakcie edycji.
- **Funkcje**:
  - `handleGenerate()`: Wywołuje API generowania.
  - `handleSave()`: Wywołuje API zapisu.
  - Funkcje do obsługi akcji na propozycjach (`handleAccept`, `handleReject`, `handleStartEdit`, etc.).

## 7. Integracja API

1.  **Generowanie propozycji**
    -   **Endpoint**: `POST /api/generations`
    -   **Typ żądania**: `GenerateFlashcardsCommand` (`{ source_text: string }`)
    -   **Typ odpowiedzi**: `GenerationCreateResponseDto`
    -   **Logika**: Po pomyślnym odebraniu danych, `flashcard_proposals` są mapowane na `FlashcardProposalViewModel`, dodając `id`, `status: 'pending'` i `edited: false`. Zapisywany jest również `generation_id`.

2.  **Zapisywanie zaakceptowanych fiszek**
    -   **Endpoint**: `POST /api/flashcards`
    -   **Typ żądania**: `FlashcardsCreateCommand` (`{ flashcards: FlashcardCreateDto[] }`)
    -   **Typ odpowiedzi**: `FlashcardDto[]`
    -   **Logika**: `proposals` są filtrowane po `status: 'accepted'`. Następnie są mapowane na `FlashcardCreateDto`, gdzie pole `source` jest ustawiane na `'ai-edited'` jeśli `proposal.edited` jest `true`, w przeciwnym razie na `'ai-full'`. Do każdej fiszki dołączany jest `generation_id`.

## 8. Interakcje użytkownika

- **Wprowadzanie tekstu**: Aktualizuje stan `sourceText` i licznik znaków.
- **Kliknięcie "Generuj"**: Uruchamia `handleGenerate`. Interfejs przechodzi w stan ładowania (`isGenerating`).
- **Kliknięcie "Akceptuj"**: Zmienia `status` propozycji na `'accepted'`. Karta zmienia wygląd. Licznik `acceptedCount` rośnie.
- **Kliknięcie "Odrzuć"**: Zmienia `status` na `'rejected'`. Karta zmienia wygląd.
- **Kliknięcie "Edytuj"**: Otwiera `EditFlashcardDialog` z danymi propozycji.
- **Zapis edycji**: Aktualizuje `front` i `back` propozycji, ustawia `status` na `'accepted'` i `edited` na `true`.
- **Kliknięcie "Zapisz X fiszek"**: Uruchamia `handleSave`. Interfejs przechodzi w stan zapisywania (`isSaving`). Po sukcesie użytkownik jest przekierowywany na listę swoich fiszek.

## 9. Warunki i walidacja

- **Formularz generowania (`GenerationForm`)**: Przycisk "Generuj" jest nieaktywny, jeśli tekst nie spełnia kryterium długości (1000-10000 znaków) lub trwa już proces generowania.
- **Formularz edycji (`EditFlashcardDialog`)**: Przycisk "Zapisz" jest nieaktywny, jeśli pole `front` (max 200) lub `back` (max 500) jest puste lub przekracza limit znaków.
- **Przyciski akcji (`ReviewActions`)**: Przycisk "Zapisz X fiszek" jest nieaktywny, jeśli `acceptedCount` wynosi 0 lub trwa proces zapisywania.

## 10. Obsługa błędów

Błędy API będą obsługiwane globalnie w hooku `useGenerationAndReview` i komunikowane użytkownikowi za pomocą powiadomień "toast" (z biblioteki `sonner`, zintegrowanej z Shadcn/ui).

- **Błąd walidacji (400)**: Toast z komunikatem "Nieprawidłowe dane wejściowe."
- **Błąd usługi AI (502)**: Toast z komunikatem "Błąd zewnętrznego serwisu AI. Spróbuj ponownie później."
- **Błąd serwera (500)**: Toast z komunikatem "Wystąpił błąd serwera."
- **Błąd sieci**: Toast z komunikatem "Błąd połączenia sieciowego."

Stan błędu będzie resetowany przy ponownej próbie wykonania akcji.

## 11. Kroki implementacji

1.  **Utworzenie struktury plików**: Stworzenie wszystkich potrzebnych plików komponentów (`GenerationView.tsx`, `GenerationForm.tsx` etc.) oraz strony `/src/pages/generate.astro`.
2.  **Zdefiniowanie typów**: Utworzenie pliku `src/types/view-models.ts` i zdefiniowanie typu `FlashcardProposalViewModel`.
3.  **Implementacja `GenerationForm`**: Zbudowanie formularza z `Textarea` i `Button` z Shadcn/ui. Dodanie logiki walidacji i obsługi stanu ładowania.
4.  **Implementacja hooka `useGenerationAndReview`**:
    -   Zdefiniowanie stanu (`useState`).
    -   Implementacja funkcji `handleGenerate` z wywołaniem API `POST /api/generations`.
5.  **Integracja `GenerationForm` z `GenerationView`**: Podłączenie stanu i funkcji z hooka do propsów `GenerationForm`.
6.  **Implementacja `ReviewSection` i komponentów podrzędnych**:
    -   Stworzenie `FlashcardProposalCard` z wariantami wizualnymi dla różnych statusów.
    -   Stworzenie `EditFlashcardDialog` z formularzem edycji.
    -   Stworzenie `ReviewActions` z licznikiem i przyciskiem zapisu.
7.  **Rozbudowa hooka `useGenerationAndReview`**:
    -   Dodanie funkcji do obsługi akcji: `handleAccept`, `handleReject`, `handleStartEdit`, `handleSaveEdit`, `handleCancelEdit`, `handleAcceptAll`, `handleRejectAll`.
    -   Implementacja funkcji `handleSave` z logiką filtrowania, mapowania i wywołaniem API `POST /api/flashcards`.
8.  **Finalna integracja**: Połączenie wszystkich komponentów w `GenerationView`, przekazanie propsów i obsługa warunkowego renderowania `ReviewSection`.
9.  **Obsługa błędów i Toastów**: Zintegrowanie systemu powiadomień "toast" do komunikowania sukcesów i błędów.
10. **Stylowanie i dopracowanie UI**: Użycie Tailwind CSS do finalnego dopracowania wyglądu i responsywności widoku.
