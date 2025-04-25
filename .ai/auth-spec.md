# Specyfikacja modułu autoryzacji w 10xCards

## ARCHITEKTURA INTERFEJSU UŻYTKOWNIKA

### 1. Strony
- **Rejestracja (/register):**
  - Strona zawiera formularz rejestracyjny z polami: email, hasło oraz potwierdzenie hasła.
  - Formularz implementowany przy użyciu komponentów React z walidacją po stronie klienta.

- **Logowanie (/login):**
  - Formularz logowania składa się z pól email i hasło.
  - W przypadku błędnych danych wyświetlane są precyzyjne komunikaty błędów, np. "Invalid credentials".

- **Resetowanie hasła (/forgot-password):**
  - Strona umożliwiająca wprowadzenie adresu email w celu wysłania linku do resetu hasła.

- **Wylogowanie:**
  - Przycisk wylogowania znajduje się w prawym górnym rogu głównego layoutu (np. `Layout.astro`) dla zalogowanych użytkowników.

### 2. Layouty i Komponenty
- **Layout (Layout.astro):**
  - Główny layout aplikacji odpowiedzialny za prezentację widoków autoryzowanych i nieautoryzowanych.
  - Dla użytkowników zalogowanych wyświetla dodatkowe elementy, takie jak przycisk wylogowania.

- **Komponenty formularzy:**
  - Formularze są dynamicznymi komponentami React, korzystającymi z biblioteki Shadcn/ui, z wbudowaną walidacją i obsługą stanu błędów.

- **Komponenty powiadomień:**
  - Informują użytkownika o wynikach operacji (np. sukces rejestracji, błędy walidacji) przy użyciu komunikatów w języku angielskim (np. "Registration Successful", "Invalid email address").

### 3. Walidacja i Komunikaty Błędów
- **Walidacja danych:**
  - Po stronie klienta sprawdzane są poprawność formatu email, siła hasła, zgodność hasła i potwierdzenia.
  - Dodatkowa walidacja odbywa się na backendzie, aby zapewnić spójność i bezpieczeństwo danych.

- **Komunikaty błędów:**
  - Precyzyjne komunikaty zwracane są zarówno po stronie klienta, jak i serwera, np. "Invalid email address", "Password does not meet strength requirements", "Passwords do not match".

### 4. Integracja z Backendem
- Formularze wysyłają zapytania do dedykowanych endpointów API (opisanych poniżej).
- Po udanej operacji użytkownik jest przekierowywany do głównych widoków aplikacji, takich jak widok generowania fiszek.

## LOGIKA BACKENDOWA

### 1. Struktura Endpointów API
- **POST /api/auth/register:**
  - Endpoint do rejestracji nowego użytkownika.
  - Wykonuje walidację danych wejściowych, tworzy konto w systemie Supabase i zwraca odpowiedni status operacji.

- **POST /api/auth/login:**
  - Endpoint logowania użytkownika.
  - Weryfikuje dane logowania z użyciem Supabase Auth i obsługuje sesje.

- **POST /api/auth/logout:**
  - Endpoint odpowiedzialny za wylogowanie użytkownika, zarządzanie sesją i czyszczenie tokenów.

- **POST /api/auth/forgot-password:**
  - Endpoint do obsługi resetu hasła.
  - Wysyła link resetujący hasło na podany adres email po weryfikacji.

### 2. Walidacja i Obsługa Błędów
- **Mechanizm walidacji:**
  - Użycie bibliotek do walidacji (np. Zod) w celu precyzyjnej weryfikacji danych wejściowych w każdym endpointcie.

- **Obsługa wyjątków:**
  - Wykorzystanie wczesnych zabezpieczeń (guard clauses) w celu natychmiastowego wychwytywania nieprawidłowych stanów.
  - Logowanie błędów i zwracanie odpowiednich kodów HTTP (np. 400, 401, 500) z przyjaznymi komunikatami.

### 3. Renderowanie Stron Server-Side
- Aktualizacja sposobu renderowania stron Astro, aby dynamicznie dostosowywać widoki w zależności od stanu autoryzacji użytkownika.
- Layouty uwzględniają identyfikację i rekomendacje dotyczące widocznych elementów dla użytkownika (np. widoczność przycisku logout tylko dla zalogowanych użytkowników).

## SYSTEM AUTENTYKACJI

### 1. Integracja z Supabase Auth
- **Supabase Auth:**
  - Wykorzystanie w pełni funkcjonalnego systemu autoryzacji Supabase do rejestracji, logowania, resetowania hasła oraz wylogowania.
  - Korzystanie z wbudowanych metod Supabase umożliwiających szybkie wdrożenie i zapewnienie skalowalności.

### 2. Moduły i Serwisy
- **Serwis Autentykacji:**
  - Warstwa serwisowa odpowiedzialna za integrację z Supabase, zarządzanie sesjami oraz tokenami autoryzacyjnymi (przechowywanie w cookies lub localStorage).
  - Umożliwia odnawianie tokenów i monitorowanie stanu sesji.

- **Middleware Astro:**
  - Integracja z middleware w Astro, która sprawdza stan autoryzacji użytkownika przed renderowaniem stron chronionych.

### 3. Kontrakty i Typy Danych
- **Wspólne Typy:**
  - Definicje typów danych użytkownika i sesji umieszczone w pliku `src/types.ts` dla ujednolicenia kontraktów między front-endem a back-endem.

- **Schematy Request/Response:**
  - Precyzyjne kontrakty HTTP definiujące strukturę zapytań i odpowiedzi dla endpointów autoryzacyjnych, co ułatwia utrzymanie spójności systemu.

## PODSUMOWANIE

Implementacja modułu autoryzacji w 10xCards obejmuje pełną ścieżkę użytkownika od rejestracji, przez logowanie i reset hasła, aż po wylogowanie. Dzięki integracji z Supabase Auth, aplikacja zapewnia bezpieczne i skalowalne środowisko. Kluczowe elementy obejmują:
- Dokładnie zaplanowaną strukturę interfejsu użytkownika, w tym strony, layouty oraz dynamiczne komponenty React.
- Solidną logikę backendową, z dedykowanymi endpointami API, walidacją danych i obsługą wyjątków.
- Bezproblemową integrację z systemem autoryzacji Supabase, wykorzystującą istniejący stos technologiczny (Astro 5, React 19, TypeScript 5, Tailwind 4, Shadcn/ui).

This specification serves as a detailed technical guide to implement the authentication module without compromising the existing functionality of the application.
