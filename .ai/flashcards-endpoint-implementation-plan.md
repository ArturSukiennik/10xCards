# Plan implementacji endpointów Flashcards API

## 1. Przegląd punktów końcowych

Implementacja dwóch endpointów REST API do tworzenia fiszek:

- Pojedyncza fiszka (`/flashcards`) - tworzenie manualnych fiszek
- Batch (`/flashcards/batch`) - tworzenie wielu fiszek jednocześnie, obsługa zarówno manualnych jak i AI-generowanych fiszek

## 2. Szczegóły żądania

### Endpoint: Create Flashcard

- Metoda HTTP: POST
- URL: `/flashcards`
- Request Body:
  ```typescript
  {
    front: string; // max 200 znaków
    back: string; // max 500 znaków
  }
  ```

### Endpoint: Create Multiple Flashcards

- Metoda HTTP: POST
- URL: `/flashcards/batch`
- Request Body:
  ```typescript
  {
    flashcards: {
      front: string;    // max 200 znaków
      back: string;     // max 500 znaków
      source: 'manual' | 'ai-full' | 'ai-edited';
    }[];
    generation_id?: number;  // wymagane dla AI-generated
  }
  ```

## 3. Wykorzystywane typy

```typescript
// src/types.ts
export enum FlashcardSource {
  Manual = "manual",
  AIFull = "ai-full",
  AIEdited = "ai-edited",
}

export interface CreateFlashcardDTO {
  front: string;
  back: string;
}

export interface CreateFlashcardBatchDTO {
  flashcards: {
    front: string;
    back: string;
    source: FlashcardSource;
  }[];
  generation_id?: number;
}

export interface FlashcardResponseDTO {
  id: number;
  front: string;
  back: string;
  source: FlashcardSource;
  created_at: string;
  updated_at: string;
}

export interface FlashcardBatchResponseDTO {
  created_count: number;
  flashcards: FlashcardResponseDTO[];
}
```

## 4. Przepływ danych

### Single Flashcard

1. Walidacja request body
2. Autoryzacja użytkownika (Supabase)
3. Utworzenie rekordu w tabeli `flashcards`
4. Zwrócenie utworzonej fiszki

### Batch Flashcards

1. Walidacja request body
2. Autoryzacja użytkownika (Supabase)
3. Jeśli podano generation_id:
   - Sprawdzenie istnienia generacji
   - Sprawdzenie czy generacja należy do użytkownika
4. Transakcyjne utworzenie wszystkich fiszek
5. Zwrócenie utworzonych fiszek

## 5. Względy bezpieczeństwa

1. Autoryzacja

   - Wykorzystanie Supabase do weryfikacji JWT
   - Sprawdzanie user_id z tokena
   - Middleware autoryzacyjne

2. Walidacja danych

   - Sanityzacja inputu
   - Sprawdzanie długości pól
   - Walidacja source enum
   - Walidacja generation_id

3. Rate limiting
   - Implementacja limitu requestów per user
   - Osobne limity dla single i batch endpointów

## 6. Obsługa błędów

```typescript
// src/lib/errors.ts
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class AuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthorizationError";
  }
}

export class GenerationNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GenerationNotFoundError";
  }
}
```

Kody odpowiedzi:

- 201: Pomyślne utworzenie
- 400: Błędy walidacji
- 401: Brak autoryzacji
- 404: Nie znaleziono generacji
- 500: Błędy serwera

## 7. Rozważania dotyczące wydajności

1. Optymalizacja batch operacji:

   - Wykorzystanie `createMany` z Supabase
   - Transakcje dla spójności danych
   - Limit wielkości batcha (max 30 fiszek)

2. Indeksy bazy danych:

   - Indeks na `user_id` w tabeli `flashcards`
   - Indeks na `generation_id` w tabeli `flashcards`

3. Caching:
   - Cache dla walidacji generation_id
   - Cache dla autoryzacji użytkownika

## 8. Etapy wdrożenia

1. Przygotowanie środowiska

   ```typescript
   // src/lib/db.ts - klient Supabase
   // src/lib/validation.ts - funkcje walidacyjne
   // src/lib/errors.ts - definicje błędów
   ```

2. Implementacja serwisu

   ```typescript
   // src/services/flashcards.service.ts
   export class FlashcardsService {
     async createFlashcard(
       userId: string,
       dto: CreateFlashcardDTO,
     ): Promise<FlashcardResponseDTO>;
     async createFlashcards(
       userId: string,
       dto: CreateFlashcardBatchDTO,
     ): Promise<FlashcardBatchResponseDTO>;
     private validateFlashcard(flashcard: CreateFlashcardDTO): void;
     private validateBatchRequest(dto: CreateFlashcardBatchDTO): void;
   }
   ```

3. Implementacja endpointów

   ```typescript
   // src/pages/api/flashcards.ts
   // src/pages/api/flashcards/batch.ts
   ```

4. Implementacja middleware

   ```typescript
   // src/middleware/auth.ts
   // src/middleware/validation.ts
   // src/middleware/rate-limit.ts
   ```

5. Testy

   - Unit testy dla serwisu
   - Integracyjne testy dla endpointów
   - Testy wydajnościowe dla batch operacji

6. Dokumentacja
   - Swagger/OpenAPI spec
   - Przykłady użycia
   - Opis kodów błędów
