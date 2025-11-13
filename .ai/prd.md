# Dokument wymagań produktu (PRD) - AI Flashcard Generator

## 1. Przegląd produktu

AI Flashcard Generator to aplikacja internetowa usprawniająca proces nauki poprzez automatyzację tworzenia fiszek edukacyjnych. Aplikacja wykorzystuje modele LLM (poprzez API) do generowania sugestii wysokiej jakości fiszek z tekstu dostarczonego przez użytkownika. Użytkownicy mogą również tworzyć, edytować i usuwać fiszki manualnie. Głównym celem produktu jest zaoszczędzenie czasu studentów i profesjonalistów oraz ułatwienie im korzystania z efektywnej metody nauki, jaką jest powtarzanie w odstępach (spaced repetition), poprzez zminimalizowanie wysiłku związanego z przygotowaniem materiałów.

## 2. Problem użytkownika

Głównym problemem, który rozwiązuje aplikacja, jest czasochłonność i trudność manualnego tworzenia fiszek. Użytkownicy często borykają się z dwoma wyzwaniami:
1. Poświęcają znaczną ilość czasu na przepisywanie i formatowanie notatek w formie pytań i odpowiedzi.
2. Mają trudności z optymalnym podziałem informacji, co prowadzi do tworzenia nieefektywnych fiszek – zbyt ogólnych lub zbyt szczegółowych.

## 3. Wymagania funkcjonalne

### 3.1. Generowanie fiszek przez AI
- Użytkownik może wkleić tekst (od 1000 do 10000 znaków) w dedykowane pole tekstowe.
- Aplikacja używa modelu GPT do analizy tekstu i generowania propozycji fiszek (kandydatów).
- Każda fiszka składa się z "przodu" (pytanie, do 200 znaków) i "tyłu" (odpowiedź, do 500 znaków).
- Zarówno tekst wejściowy, jak i wygenerowane fiszki podlegają walidacji na poziomie frontendu, backendu i bazy danych.

### 3.2. Tworzenie fiszek manualnie
- Użytkownik może również stworzyć fiszkę manualnie przez guzik "Utwórz fiszkę"
- Utworzona fiszka manualnie musi spełniać takie same warunki jak wygenerowana przez AI - fiszka składa się z "przodu" (pytanie, do 200 znaków) i "tyłu" (odpowiedź, do 500 znaków).
- Podlegają walidacji na poziomie frontendu, backendu i bazy danych.

### 3.3. Proces recenzji wygenerowanych fiszek
- Po wygenerowaniu, użytkownik jest przenoszony do interfejsu recenzji, gdzie widzi listę fiszek-kandydatów.
- Dla każdej propozycji użytkownik ma trzy opcje: zaakceptuj, edytuj lub odrzuć.
- Tylko zaakceptowane (lub zaakceptowane i edytowane) fiszki są zapisywane w bazie danych.

### 3.4. Zarządzanie fiszkami
- Użytkownicy mogą manualnie tworzyć fiszki za pomocą prostego formularza (przód i tył).
- Użytkownicy mogą edytować istniejące fiszki.
- Użytkownicy mogą usuwać pojedyncze fiszki.

## 4. Granice produktu

### 4.1. Co wchodzi w zakres MVP
- Generowanie fiszek z wklejonego tekstu.
- Manualne tworzenie, edycja i usuwanie fiszek.
- Prosty system kont (e-mail/hasło).
- Prosty mechanizm nauki oparty na archiwizacji.

### 4.2. Co NIE wchodzi w zakres MVP
- Zaawansowany algorytm powtórek w odstępach (np. SuperMemo, Anki).
- Import plików w formatach PDF, DOCX, itp.
- Współdzielenie fiszek.
- Integrac
