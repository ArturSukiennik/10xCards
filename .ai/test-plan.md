# Plan Testów dla Aplikacji 10xCards

## 1. Wprowadzenie i cele testowania

Celem niniejszego planu testów jest zapewnienie wysokiej jakości i niezawodności aplikacji 10xCards, która umożliwia automatyczne generowanie fiszek przy użyciu sztucznej inteligencji. Plan definiuje kompleksowe podejście do testowania wszystkich komponentów aplikacji, z uwzględnieniem specyfiki stosu technologicznego oraz architektury systemu.

### Główne cele testowania:

- Weryfikacja poprawności działania generowania fiszek przy użyciu AI
- Zapewnienie niezawodności operacji CRUD dla fiszek
- Testowanie mechanizmów autentykacji i autoryzacji
- Walidacja responsywności i dostępności interfejsu użytkownika
- Weryfikacja integracji z zewnętrznymi usługami (Supabase, OpenRouter.ai)
- Zapewnienie wydajności i skalowalności aplikacji

## 2. Zakres testów

### Komponenty objęte testami:

- Frontend: Komponenty Astro i React, interfejs użytkownika, interakcje z użytkownikiem
- Backend: Endpointy API, middleware, autentykacja
- Integracje: Komunikacja z Supabase i OpenRouter.ai
- Baza danych: Operacje CRUD, relacje między tabelami
- Bezpieczeństwo: Mechanizmy autentykacji, autoryzacja, ochrona danych

### Komponenty wyłączone z testów:

- Infrastruktura DigitalOcean (testowane osobno w ramach CI/CD)
- Wewnętrzne implementacje modeli AI w OpenRouter.ai

## 3. Typy testów

### 3.1. Testy jednostkowe

- **Zakres**: Funkcje pomocnicze, walidatory, mapery, usługi
- **Narzędzia**: Vitest
- **Lokalizacja testów**: `/tests/unit`

#### Kluczowe obszary testów jednostkowych:

- Walidacja schematów Zod (`/src/lib/validation`)
- Funkcje mapujące z typów bazy danych do DTO
- Usługi OpenRouter i inne serwisy
- Store'y i hooki React

### 3.2. Testy integracyjne

- **Zakres**: Komunikacja między komponentami, komunikacja z API
- **Narzędzia**: Vitest z MSW (Mock Service Worker)
- **Lokalizacja testów**: `/tests/integration`

#### Kluczowe obszary testów integracyjnych:

- Integracja z Supabase (uwierzytelnianie, operacje bazodanowe)
- Komunikacja między komponentami React
- Przepływ danych między frontendem a endpointami API

### 3.3. Testy API

- **Zakres**: Wszystkie endpointy API aplikacji
- **Narzędzia**: Supertest, Postman
- **Lokalizacja testów**: `/tests/api`

#### Kluczowe endpointy do testowania:

- `/api/generations.ts` - generowanie fiszek AI
- `/api/flashcards.ts` - zarządzanie fiszkami
- `/api/auth.ts` - autentykacja użytkowników

### 3.4. Testy E2E (End-to-End)

- **Zakres**: Pełne przepływy użytkownika, scenariusze biznesowe
- **Narzędzia**: Playwright
- **Lokalizacja testów**: `/tests/e2e`

#### Kluczowe scenariusze E2E:

- Rejestracja i logowanie użytkownika
- Generowanie fiszek z tekstu
- Edycja i zapisywanie wygenerowanych fiszek
- Przeglądanie zapisanych fiszek

### 3.5. Testy komponentów UI

- **Zakres**: Komponenty React i Astro
- **Narzędzia**: Testing Library, Storybook
- **Lokalizacja testów**: `/tests/components`

#### Kluczowe komponenty do testowania:

- GenerateView.tsx
- FlashcardsList.tsx
- FlashcardItem.tsx
- TextInputSection.tsx
- Komponenty UI z biblioteki Shadcn/ui

### 3.6. Testy wydajnościowe

- **Zakres**: Wydajność frontendowa i backendowa
- **Narzędzia**: Lighthouse, k6
- **Lokalizacja testów**: `/tests/performance`

#### Kluczowe obszary testów wydajnościowych:

- Czas ładowania aplikacji
- Wydajność generowania fiszek
- Wydajność zapisu i pobierania fiszek

### 3.7. Testy dostępności

- **Zakres**: Zgodność z WCAG 2.1
- **Narzędzia**: axe-core, Lighthouse
- **Lokalizacja testów**: `/tests/accessibility`

## 4. Scenariusze testowe dla kluczowych funkcjonalności

### 4.1. Generowanie fiszek z tekstu

1. **Scenariusz**: Generowanie fiszek dla krótkiego tekstu

   - Wprowadzenie tekstu źródłowego (< 500 znaków)
   - Wybór modelu AI
   - Weryfikacja wygenerowanych fiszek

2. **Scenariusz**: Generowanie fiszek dla długiego tekstu

   - Wprowadzenie długiego tekstu (> 2000 znaków)
   - Weryfikacja czasu odpowiedzi i jakości wygenerowanych fiszek

3. **Scenariusz**: Obsługa błędów generowania
   - Symulacja niedostępności API OpenRouter
   - Weryfikacja obsługi błędów i komunikatów dla użytkownika

### 4.2. Zarządzanie fiszkami

1. **Scenariusz**: Zapisywanie wszystkich wygenerowanych fiszek

   - Generowanie fiszek
   - Zapisanie wszystkich bez edycji
   - Weryfikacja zapisanych danych w bazie

2. **Scenariusz**: Zapisywanie tylko zaakceptowanych fiszek

   - Generowanie fiszek
   - Akceptacja wybranych fiszek
   - Zapisanie tylko zaakceptowanych fiszek
   - Weryfikacja zapisanych danych w bazie

3. **Scenariusz**: Edycja wygenerowanych fiszek przed zapisem
   - Generowanie fiszek
   - Edycja frontu/tyłu wybranych fiszek
   - Zapisanie edytowanych fiszek
   - Weryfikacja zmian w bazie danych

### 4.3. Autentykacja użytkowników

1. **Scenariusz**: Rejestracja nowego użytkownika

   - Wypełnienie formularza rejestracji
   - Weryfikacja utworzenia konta i przekierowania
   - Sprawdzenie danych w bazie Supabase

2. **Scenariusz**: Logowanie użytkownika

   - Wypełnienie formularza logowania
   - Weryfikacja dostępu do zabezpieczonych stron
   - Weryfikacja tokenów sesji

3. **Scenariusz**: Resetowanie hasła
   - Żądanie resetowania hasła
   - Weryfikacja wysłania e-maila
   - Testowanie linku resetowania hasła

## 5. Środowisko testowe

### 5.1. Środowisko lokalne (development)

- **Konfiguracja**: Lokalna instancja Supabase, mocki dla OpenRouter.ai
- **Cel**: Szybkie iteracje, testy jednostkowe i integracyjne

### 5.2. Środowisko testowe (staging)

- **Konfiguracja**: Testowa instancja Supabase, testowe konto OpenRouter.ai
- **Cel**: Testy integracyjne, E2E, wydajnościowe

### 5.3. Środowisko produkcyjne

- **Konfiguracja**: Produkcyjna instancja Supabase, produkcyjne konto OpenRouter.ai
- **Cel**: Testy smoke, monitoring

## 6. Narzędzia do testowania

### 6.1. Narzędzia testowania frontend

- **Vitest**: Testy jednostkowe i integracyjne dla komponentów React
- **Testing Library**: Testowanie komponentów UI
- **Playwright**: Testy E2E
- **Storybook**: Izolowane testowanie komponentów UI
- **Lighthouse**: Wydajność, dostępność, SEO

### 6.2. Narzędzia testowania backend

- **Vitest**: Testy jednostkowe dla logiki backendowej
- **MSW (Mock Service Worker)**: Mockowanie API
- **Supertest**: Testowanie endpointów API
- **k6**: Testy wydajnościowe i obciążeniowe

### 6.3. Narzędzia testowania dostępności

- **axe-core**: Automatyczne testy dostępności
- **WAVE**: Weryfikacja dostępności

### 6.4. CI/CD

- **GitHub Actions**: Automatyzacja testów
- **Docker**: Konteneryzacja środowiska testowego

## 7. Harmonogram testów

### 7.1. Testowanie podczas rozwoju

- Testy jednostkowe przed każdym commitem
- Testy integracyjne przed każdym pull requestem
- Testy komponentów UI podczas implementacji nowych funkcji

### 7.2. Testowanie przed wydaniem

- Pełne testy integracyjne
- Testy E2E dla kluczowych przepływów
- Testy wydajnościowe
- Testy dostępności

### 7.3. Testowanie regresji

- Po każdej większej zmianie
- Automatyczne testy nocne na środowisku staging

## 8. Kryteria akceptacji testów

### 8.1. Ogólne kryteria akceptacji

- 90% pokrycia kodu testami jednostkowymi
- 100% zdanych testów jednostkowych i integracyjnych
- Wszystkie krytyczne ścieżki E2E muszą być zdane
- Brak krytycznych błędów dostępności (poziom A WCAG 2.1)
- Wydajność frontendowa: Lighthouse Performance Score >= 90

### 8.2. Kryteria akceptacji dla generowania fiszek

- Generowanie fiszek w czasie < 10 sekund
- Co najmniej 90% generowanych fiszek jest poprawnych merytorycznie
- Obsługa wszystkich przypadków błędów z odpowiednimi komunikatami

### 8.3. Kryteria akceptacji dla autentykacji

- Bezpieczne przechowywanie danych użytkownika
- Poprawne zarządzanie sesją
- Odpowiednia walidacja danych wejściowych

## 9. Role i odpowiedzialności w procesie testowania

### 9.1. Programiści

- Tworzenie i utrzymanie testów jednostkowych
- Rozwiązywanie błędów znalezionych podczas testowania
- Pisanie testów komponentów UI

### 9.2. Testerzy

- Projektowanie przypadków testowych
- Wykonywanie testów manualnych
- Utrzymanie i wykonywanie testów automatycznych
- Raportowanie błędów

### 9.3. DevOps

- Konfiguracja i utrzymanie środowisk testowych
- Integracja testów z pipeline'ami CI/CD
- Monitoring wydajności i stabilności

## 10. Procedury raportowania błędów

### 10.1. System śledzenia błędów

- GitHub Issues jako główny system śledzenia błędów
- Kategorie błędów: krytyczny, wysoki, średni, niski

### 10.2. Format raportowania błędów

- Tytuł opisujący problem
- Środowisko, w którym wystąpił błąd
- Kroki do odtworzenia
- Oczekiwane vs. faktyczne zachowanie
- Zrzuty ekranu/logi (jeśli dostępne)
- Priorytet i sugerowana waga błędu

### 10.3. Proces obsługi błędów

- Triaging nowych błędów (weryfikacja, kategoryzacja)
- Przypisanie do odpowiedzialnych osób
- Śledzenie statusu naprawy
- Weryfikacja rozwiązania

## 11. Zarządzanie ryzykiem

### 11.1. Identyfikacja ryzyka

- Opóźnienia w integracji z OpenRouter.ai
- Problemy z wydajnością przy dużej liczbie użytkowników
- Problemy z dostępnością usług zewnętrznych

### 11.2. Strategie minimalizacji ryzyka

- Tworzenie mocków dla zewnętrznych usług
- Testy wydajnościowe wcześnie w cyklu rozwoju
- Regularne audyty bezpieczeństwa
- Plany awaryjne dla kluczowych zależności

## 12. Strategia testów bezpieczeństwa

### 12.1. Obszary testów bezpieczeństwa

- Autentykacja i autoryzacja
- Walidacja danych wejściowych
- Ochrona przed atakami XSS i CSRF
- Bezpieczne przechowywanie danych

### 12.2. Metodologie testów bezpieczeństwa

- Automatyczne skanowanie kodu źródłowego
- Testy penetracyjne
- Audyty bezpieczeństwa
- Weryfikacja zgodności z OWASP Top 10

## 13. Metryki i raportowanie

### 13.1. Kluczowe metryki

- Pokrycie kodu testami
- Liczba znalezionych/rozwiązanych błędów
- Czas wykonania testów
- Stabilność testów automatycznych
- Wydajność aplikacji w czasie

### 13.2. Raportowanie

- Automatyczne raporty po każdym uruchomieniu testów
- Tygodniowe podsumowanie statusu testów
- Raporty po wydaniu

## 14. Podsumowanie

Niniejszy plan testów stanowi kompleksowe podejście do zapewnienia jakości aplikacji 10xCards. Dzięki zastosowaniu różnorodnych typów testów i narzędzi, będziemy w stanie zapewnić wysoką jakość produktu, jego niezawodność oraz satysfakcję użytkowników końcowych.

Regularna aktualizacja planu testów będzie kluczowa dla utrzymania jego aktualności wraz z rozwojem aplikacji i pojawianiem się nowych funkcji i technologii.
