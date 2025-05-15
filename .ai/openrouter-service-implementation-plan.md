# Plan implementacji usługi OpenRouter

## 1. Opis usługi

OpenRouterService to kluczowy komponent systemu 10xCards odpowiedzialny za komunikację z API OpenRouter.ai. Usługa ta zapewnia jednolity interfejs do interakcji z różnymi modelami AI, obsługując generowanie flashcards i inne operacje wymagające przetwarzania języka naturalnego.

### Główne funkcjonalności:

- Zarządzanie komunikacją z API OpenRouter.ai
- Konfiguracja i wybór modeli AI
- Formatowanie zapytań i odpowiedzi
- Obsługa błędów i retry logic
- Zarządzanie limitami i kosztami

## 2. Opis konstruktora

```typescript
class OpenRouterService {
  constructor(
    private readonly config: {
      apiKey: string;
      defaultModel: string;
      maxRetries?: number;
      timeout?: number;
      baseUrl?: string;
    }
  ) {
    // Walidacja konfiguracji
    if (!config.apiKey) throw new Error("API key is required");
    if (!config.defaultModel) throw new Error("Default model is required");

    this.config = {
      maxRetries: 3,
      timeout: 30000,
      baseUrl: "https://openrouter.ai/api/v1",
      ...config,
    };
  }
}
```

## 3. Publiczne metody i pola

### 3.1 Metoda: generateCompletion

```typescript
async generateCompletion(params: {
  systemMessage: string;
  userMessage: string;
  responseFormat?: JSONSchema;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}): Promise<CompletionResponse>
```

### 3.2 Metoda: generateFlashcards

```typescript
async generateFlashcards(params: {
  content: string;
  numberOfCards: number;
  difficulty?: 'basic' | 'intermediate' | 'advanced';
  language?: string;
}): Promise<Flashcard[]>
```

### 3.3 Metoda: getAvailableModels

```typescript
async getAvailableModels(): Promise<ModelInfo[]>
```

## 4. Prywatne metody i pola

### 4.1 Metoda: formatRequest

```typescript
private formatRequest(params: {
  systemMessage: string;
  userMessage: string;
  responseFormat?: JSONSchema;
}): RequestPayload
```

### 4.2 Metoda: handleResponse

```typescript
private handleResponse<T>(response: Response): Promise<T>
```

### 4.3 Metoda: executeWithRetry

```typescript
private async executeWithRetry<T>(
  operation: () => Promise<T>,
  retries: number = this.config.maxRetries
): Promise<T>
```

## 5. Obsługa błędów

### 5.1 Typy błędów

```typescript
class OpenRouterError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status?: number,
    public readonly details?: unknown
  ) {
    super(message);
  }
}

class OpenRouterAuthenticationError extends OpenRouterError {}
class OpenRouterRateLimitError extends OpenRouterError {}
class OpenRouterModelNotAvailableError extends OpenRouterError {}
class OpenRouterInvalidRequestError extends OpenRouterError {}
```

### 5.2 Strategia obsługi błędów

- Automatyczne ponowne próby dla błędów sieciowych i czasowych
- Logowanie błędów do systemu monitoringu
- Przejrzyste komunikaty błędów dla użytkownika końcowego
- Graceful degradation przy niedostępności preferowanego modelu

## 6. Kwestie bezpieczeństwa

### 6.1 Bezpieczne przechowywanie kluczy

- Klucze API przechowywane w zmiennych środowiskowych

### 6.2 Walidacja danych

- Sanityzacja wszystkich danych wejściowych
- Walidacja limitów i formatów

### 6.3 Rate limiting

- Implementacja lokalnego rate limitingu
- Respektowanie limitów API OpenRouter
- Buforowanie odpowiedzi gdzie możliwe

## 7. Plan wdrożenia krok po kroku

### Krok 1: Konfiguracja projektu

1. Utworzenie nowego modułu w `src/lib/openrouter`
2. Konfiguracja zmiennych środowiskowych
3. Instalacja zależności (axios/fetch, zod)

### Krok 2: Implementacja podstawowej struktury

1. Utworzenie klasy OpenRouterService
2. Implementacja konstruktora i podstawowej walidacji
3. Dodanie typów i interfejsów

### Krok 3: Implementacja core funkcjonalności

1. Implementacja metody generateCompletion
2. Dodanie obsługi formatowania zapytań
3. Implementacja retry logic

### Krok 4: Implementacja funkcjonalności flashcards

1. Utworzenie schematu JSON dla flashcards
2. Implementacja metody generateFlashcards
3. Dodanie walidacji i transformacji danych

### Krok 5: Implementacja obsługi błędów

1. Utworzenie hierarchii klas błędów
2. Implementacja systemu logowania błędów
3. Dodanie obsługi retry dla odpowiednich przypadków

## Przykłady użycia

### Podstawowe użycie

```typescript
const openRouter = new OpenRouterService({
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultModel: "gpt-3.5-turbo",
});

const flashcards = await openRouter.generateFlashcards({
  content: "Text to generate flashcards from",
  numberOfCards: 5,
});
```

### Użycie z niestandardowym formatem odpowiedzi

```typescript
const completion = await openRouter.generateCompletion({
  systemMessage: "You are a helpful assistant",
  userMessage: "Generate a JSON response",
  responseFormat: {
    type: "json_schema",
    json_schema: {
      name: "FlashcardResponse",
      strict: true,
      schema: {
        type: "object",
        properties: {
          front: { type: "string" },
          back: { type: "string" },
        },
        required: ["front", "back"],
      },
    },
  },
});
```
