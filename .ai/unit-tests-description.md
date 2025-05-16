# Plan Testów Jednostkowych dla 10xCards

## 1. Komponenty Generowania Fiszek (/src/components/generate/)

### FlashcardItem.tsx

**Co testować:**

- Logikę walidacji pojedynczej fiszki
- Transformacje danych fiszki
- Obsługę stanów (edycja, zapisywanie, błędy)

**Dlaczego:**

- Kluczowy komponent biznesowy zawierający logikę transformacji i walidacji danych
- Błędy w tym komponencie bezpośrednio wpływają na jakość generowanych fiszek
- Złożona logika stanów wymaga dokładnego przetestowania

### TextInputSection.tsx

**Co testować:**

- Walidację wprowadzanego tekstu
- Logikę przetwarzania tekstu przed wysłaniem do API
- Obsługę limitów tekstu

**Dlaczego:**

- Komponent odpowiada za przygotowanie danych wejściowych do generacji
- Błędy w tym miejscu wpływają na cały proces generowania fiszek
- Krytyczny dla UX i wydajności aplikacji

## 2. Komponenty UI (/src/components/ui/)

### form.tsx

**Co testować:**

- Logikę walidacji formularzy
- Obsługę błędów
- Transformacje danych formularza

**Dlaczego:**

- Formularze są używane w wielu miejscach aplikacji
- Błędy w tym komponencie mają szeroki wpływ na UX
- Złożona logika walidacji wymaga dokładnego przetestowania

### validation-error.tsx

**Co testować:**

- Logikę formatowania komunikatów błędów
- Obsługę różnych typów błędów

**Dlaczego:**

- Spójne wyświetlanie błędów jest kluczowe dla UX
- Komponent używany w całej aplikacji

### select.tsx

**Co testować:**

- Logikę filtrowania i wyszukiwania
- Obsługę różnych formatów danych

**Dlaczego:**

- Złożony komponent z własną logiką biznesową
- Szeroko używany w aplikacji

## 3. Serwisy (/src/lib/services/)

### generation.service.ts

**Co testować:**

- Logikę generowania fiszek
- Obsługę błędów generacji
- Transformacje danych
- Retry logic

**Dlaczego:**

- Główny serwis biznesowy aplikacji
- Odpowiada za kluczową funkcjonalność
- Złożona logika obsługi błędów i transformacji danych

### flashcards.service.ts

**Co testować:**

- Operacje CRUD na fiszkach
- Walidację danych
- Mapowanie danych
- Obsługę błędów bazy danych

**Dlaczego:**

- Odpowiada za zarządzanie danymi w bazie
- Krytyczny dla integralności danych
- Złożona logika mapowania i walidacji

### openrouter.service.ts

**Co testować:**

- Komunikację z API OpenRouter
- Obsługę błędów API
- Retry logic
- Transformacje odpowiedzi

**Dlaczego:**

- Krytyczny serwis integracyjny
- Błędy mogą zatrzymać główną funkcjonalność aplikacji
- Złożona logika obsługi błędów i ponownych prób

## 4. Walidatory (/src/lib/validation/)

### flashcards.validation.ts

**Co testować:**

- Schematy walidacji
- Reguły biznesowe
- Edge cases

**Dlaczego:**

- Walidacja jest krytyczna dla jakości danych
- Reguły biznesowe muszą być precyzyjnie przetestowane
- Wiele przypadków brzegowych do obsłużenia

### generation.schema.ts

**Co testować:**

- Schematy walidacji danych wejściowych
- Ograniczenia i limity
- Obsługę nieprawidłowych danych

**Dlaczego:**

- Zapewnia jakość danych wejściowych
- Chroni przed nieprawidłowymi danymi
- Krytyczny dla stabilności procesu generacji

## 5. Store'y i Hooki (/src/lib/stores/, /src/lib/hooks/)

### authStore.ts

**Co testować:**

- Logikę zarządzania stanem autoryzacji
- Obsługę sesji
- Synchronizację stanu

**Dlaczego:**

- Krytyczny dla bezpieczeństwa aplikacji
- Odpowiada za stan autoryzacji w całej aplikacji
- Złożona logika zarządzania stanem

### useFlashcardGeneration.ts

**Co testować:**

- Logikę biznesową generowania fiszek
- Obsługę stanu generacji
- Zarządzanie błędami
- Integrację z serwisami

**Dlaczego:**

- Złożony hook zawierający kluczową logikę biznesową
- Integruje wiele serwisów i komponentów
- Krytyczny dla głównej funkcjonalności aplikacji

## 6. Utilities (/src/lib/)

### utils.ts i errors.ts

**Co testować:**

- Funkcje pomocnicze
- Obsługę błędów
- Transformacje danych

**Dlaczego:**

- Współdzielone utility używane w wielu miejscach
- Błędy mają szeroki wpływ na aplikację
- Podstawowe building blocks aplikacji

## Dobre Praktyki przy Pisaniu Testów Jednostkowych

### 1. Priorytetyzacja

- Najpierw testować krytyczne serwisy biznesowe
- Następnie komponenty z własną logiką
- Na końcu proste komponenty UI

### 2. Co Testować

- Logikę biznesową
- Obsługę błędów
- Edge cases
- Transformacje danych
- Walidację

### 3. Czego Nie Testować

- Implementacji bibliotek zewnętrznych
- Prostych komponentów prezentacyjnych
- Konfiguracji
- Stylów CSS

### 4. Zasady

- Używać mocków dla zewnętrznych zależności
- Testować małe, izolowane jednostki kodu
- Skupić się na testowaniu zachowania, nie implementacji
- Pisać testy przed implementacją (TDD) gdy to możliwe

## Struktura Katalogów Testów

```
/tests/unit/
├── services/
│   ├── generation.service.test.ts
│   ├── flashcards.service.test.ts
│   └── openrouter.service.test.ts
├── components/
│   ├── generate/
│   │   ├── FlashcardItem.test.tsx
│   │   └── TextInputSection.test.tsx
│   └── ui/
│       ├── form.test.tsx
│       └── validation-error.test.tsx
├── validation/
│   ├── flashcards.validation.test.ts
│   └── generation.schema.test.ts
├── hooks/
│   └── useFlashcardGeneration.test.ts
└── stores/
    └── authStore.test.ts
```

## Narzędzia i Setup

### Vitest

- Framework testowy
- Szybkie wykonanie testów
- Dobra integracja z React i TypeScript

### Testing Library

- Testowanie komponentów React
- Fokus na zachowaniu użytkownika
- Dobre praktyki testowania UI

### MSW (Mock Service Worker)

- Mockowanie API
- Testowanie integracji
- Spójne zachowanie w testach

## Cele Pokrycia Testami

- Serwisy biznesowe: 90%+ pokrycia
- Komponenty z logiką: 80%+ pokrycia
- Utilities: 90%+ pokrycia
- Walidatory: 100% pokrycia
- Hooki i store'y: 85%+ pokrycia

## Wnioski

Testy jednostkowe w projekcie 10xCards powinny skupiać się na kluczowej logice biznesowej, szczególnie w obszarze generowania i zarządzania fiszkami. Priorytetem jest zapewnienie niezawodności i poprawności działania głównych funkcjonalności aplikacji. Poprzez systematyczne testowanie wszystkich wskazanych komponentów i serwisów, możemy znacząco zwiększyć jakość i niezawodność aplikacji.
