# Plan Testów dla Projektu 10xCards

## 1. Wprowadzenie i Cele Testowania

Celem testowania jest zapewnienie wysokiej jakości aplikacji 10xCards, która umożliwia automatyczne generowanie fiszek przy użyciu AI. Plan testów koncentruje się na weryfikacji kluczowych funkcjonalności, wydajności oraz doświadczenia użytkownika.

### Główne Cele:

- Weryfikacja poprawności generowania fiszek przez AI
- Zapewnienie stabilności i wydajności aplikacji
- Walidacja integracji z zewnętrznymi serwisami (Supabase, OpenRouter.ai)
- Potwierdzenie zgodności z wymaganiami UX/UI

## 2. Zakres Testów

### Komponenty Podlegające Testowaniu:

- Frontend (Astro + React)
- Integracja z backendem (Supabase)
- Integracja z AI (OpenRouter.ai)
- System autentykacji
- Zarządzanie fiszkami
- Interfejs użytkownika

### Poza Zakresem:

- Testy wewnętrznej infrastruktury Supabase
- Testy wewnętrznych mechanizmów OpenRouter.ai

## 3. Typy Testów

### 3.1 Testy Jednostkowe

- Komponenty React
- Funkcje pomocnicze
- Transformacje danych
- Walidatory

### 3.2 Testy Integracyjne

- Przepływ danych między komponentami
- Integracja z Supabase
- Integracja z OpenRouter.ai
- Przepływ autentykacji

### 3.3 Testy E2E

- Proces rejestracji i logowania
- Generowanie fiszek
- Zarządzanie kolekcjami fiszek
- Eksport/import danych

### 3.4 Testy Wydajnościowe

- Czas odpowiedzi API
- Wydajność generowania fiszek
- Optymalizacja ładowania strony
- Zużycie zasobów przeglądarki

### 3.5 Testy Bezpieczeństwa

- Autoryzacja i autentykacja
- Zabezpieczenie endpointów API
- Walidacja danych wejściowych
- Ochrona kluczy API

## 4. Scenariusze Testowe

### 4.1 Autentykacja

1. Rejestracja nowego użytkownika
2. Logowanie istniejącego użytkownika
3. Resetowanie hasła
4. Weryfikacja email
5. Wylogowanie

### 4.2 Generowanie Fiszek

1. Generowanie fiszek z tekstu
2. Edycja wygenerowanych fiszek
3. Zapisywanie fiszek do kolekcji
4. Eksport fiszek
5. Import fiszek

### 4.3 Zarządzanie Kolekcjami

1. Tworzenie nowej kolekcji
2. Edycja kolekcji
3. Usuwanie kolekcji
4. Udostępnianie kolekcji
5. Organizacja fiszek w kolekcjach

### 4.4 Interfejs Użytkownika

1. Responsywność
2. Dostępność (WCAG)
3. Spójność wizualna
4. Obsługa błędów
5. Komunikaty systemowe

## 5. Środowisko Testowe

### 5.1 Środowiska

- Developerskie (local)
- Staging
- Produkcyjne

### 5.2 Wymagania

- Node.js v18+
- Przeglądarka: Chrome, Firefox, Safari, Edge
- Dostęp do Supabase
- Dostęp do OpenRouter.ai
- Konfiguracja zmiennych środowiskowych

## 6. Narzędzia do Testowania

### 6.1 Testy Jednostkowe i Integracyjne

- Vitest
- React Testing Library
- MSW (Mock Service Worker)

### 6.2 Testy E2E

- Playwright
- Cypress

### 6.3 Testy Wydajnościowe

- Lighthouse
- WebPageTest
- Chrome DevTools Performance

### 6.4 Testy Bezpieczeństwa

- OWASP ZAP
- SonarQube

## 7. Harmonogram Testów

### 7.1 Fazy Testowania

1. Testy jednostkowe (ciągłe)
2. Testy integracyjne (po każdym sprincie)
3. Testy E2E (przed każdym wydaniem)
4. Testy wydajnościowe (raz w tygodniu)
5. Testy bezpieczeństwa (raz w miesiącu)

### 7.2 Cykl Testowy

- Planowanie testów: 1 dzień
- Wykonanie testów: 2-3 dni
- Raportowanie i analiza: 1 dzień
- Retesty po poprawkach: 1-2 dni

## 8. Kryteria Akceptacji

### 8.1 Kryteria Ilościowe

- Pokrycie testami jednostkowymi: min. 80%
- Wszystkie testy E2E przechodzą
- Czas odpowiedzi API < 500ms
- Lighthouse score > 90

### 8.2 Kryteria Jakościowe

- Brak krytycznych błędów
- Spójne działanie we wszystkich przeglądarkach
- Pozytywna ocena UX
- Zgodność z wymaganiami biznesowymi

## 9. Role i Odpowiedzialności

### 9.1 QA Team

- Planowanie i wykonywanie testów
- Raportowanie błędów
- Weryfikacja poprawek
- Aktualizacja dokumentacji testowej

### 9.2 Developers

- Testy jednostkowe
- Code review
- Poprawki błędów
- Wsparcie w testach integracyjnych

### 9.3 DevOps

- Konfiguracja środowisk
- Monitoring
- CI/CD pipeline
- Wsparcie w testach wydajnościowych

## 10. Procedury Raportowania Błędów

### 10.1 Klasyfikacja Błędów

- Krytyczne: blokują główne funkcjonalności
- Wysokie: znaczący wpływ na UX
- Średnie: problemy funkcjonalne
- Niskie: drobne błędy UI

### 10.2 Format Zgłoszenia

- Tytuł
- Priorytet
- Środowisko
- Kroki reprodukcji
- Oczekiwany rezultat
- Aktualny rezultat
- Załączniki (screenshoty, logi)

### 10.3 Proces Obsługi

1. Zgłoszenie błędu
2. Triaging
3. Przypisanie
4. Naprawa
5. Weryfikacja
6. Zamknięcie

## 11. Raportowanie i Metryki

### 11.1 Raporty Dzienne

- Liczba wykonanych testów
- Znalezione błędy
- Status poprawek
- Blokery

### 11.2 Raporty Tygodniowe

- Postęp testów
- Trendy w błędach
- Metryki wydajności
- Rekomendacje

### 11.3 Kluczowe Metryki

- Pokrycie testami
- Czas wykonania testów
- Liczba błędów per komponent
- Mean Time To Repair (MTTR)
