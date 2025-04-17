Jesteś doświadczonym architektem oprogramowania, którego zadaniem jest stworzenie szczegółowego planu wdrożenia punktu końcowego REST API. Twój plan poprowadzi zespół programistów w skutecznym i poprawnym wdrożeniu tego punktu końcowego.

Zanim zaczniemy, zapoznaj się z poniższymi informacjami:

1. Route API specification:
<route_api_specification>
### Flashcards Endpoints

#### Create Flashcard (Manual)
- Method: POST
- Path: `/flashcards`
- Description: Create a new flashcard manually
- Request Payload:
  ```json
  {
    "front": "What is REST?",
    "back": "REST is an architectural style for APIs..."
  }
  ```
- Response Payload:
  ```json
  {
    "id": 1,
    "front": "What is REST?",
    "back": "REST is an architectural style for APIs...",
    "source": "manual",
    "created_at": "2023-06-15T10:00:00Z",
    "updated_at": "2023-06-15T10:00:00Z"
  }
  ```
- Success: 201 Created
- Errors:
  - 400 Bad Request (Invalid data)
  - 401 Unauthorized (Not logged in)

#### Create Multiple Flashcards
- Method: POST
- Path: `/flashcards/batch`
- Description: Create multiple flashcards at once (supports manual creation and AI-generated flashcards)
- Request Payload:
  ```json
  {
    "flashcards": [
      {
        "front": "What is REST?",
        "back": "REST is an architectural style for APIs...",
        "source": "manual"
      },
      {
        "front": "What is an API?",
        "back": "Application Programming Interface...",
        "source": "ai-full"
      },
      {
        "front": "What is JSON?",
        "back": "JavaScript Object Notation...",
        "source": "ai-edited"
      }
    ],
    "generation_id": 123  // Optional, required only for AI-generated flashcards
  }
  ```
- Response Payload:
  ```json
  {
    "created_count": 3,
    "flashcards": [
      {
        "id": 101,
        "front": "What is REST?",
        "back": "REST is an architectural style for APIs...",
        "source": "manual",
        "created_at": "2023-06-15T10:00:00Z",
        "updated_at": "2023-06-15T10:00:00Z"
      },
      {
        "id": 102,
        "front": "What is an API?",
        "back": "Application Programming Interface...",
        "source": "ai-full",
        "created_at": "2023-06-15T10:00:00Z",
        "updated_at": "2023-06-15T10:00:00Z"
      },
      {
        "id": 103,
        "front": "What is JSON?",
        "back": "JavaScript Object Notation...",
        "source": "ai-edited",
        "created_at": "2023-06-15T10:00:00Z",
        "updated_at": "2023-06-15T10:00:00Z"
      }
    ]
  }
  ```
- Success: 201 Created
- Errors:
  - 400 Bad Request (Invalid data)
  - 401 Unauthorized (Not logged in)
  - 404 Not Found (Generation not found, if generation_id is provided)

</route_api_specification>

2. Related database resources:
<related_db_resources>
### Tabela `users`
- `id` UUID PRIMARY KEY
- `email`: VARCHAR(255) NOT NULL UNIQUE
- `encrypted_password`: VARCHAR NOT NULL
- `created_at`: TIMESTAMPTZ NOT NULL DEFAULT now()
- `confirmed_at`: TIMESTAMPTZ
- To jest tabela zarządzana przez Supabase.

### Tabela `flashcards`
- `id` BIGSERIAL PRIMARY KEY
- `user_id` UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT
- `front` VARCHAR(200) NOT NULL
- `back` VARCHAR(500) NOT NULL
- `source` VARCHAR(20) NOT NULL CHECK (source IN ('ai-full', 'ai-edited', 'manual'))
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
- `updated_at` TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
- `generation_id` BIGSERIAL  NOT NULL REFERENCES generations(id)

### Tabela `generations`
- `id` BIGSERIAL PRIMARY KEY
- `user_id` UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT
- `model` VARCHAR NOT NULL
- `generated_count` INTEGER NOT NULL
- `generated_unedited_count` INTEGER NULLABLE
- `accepted_edited_count` INTEGER NULLABLE
- `source_text_hash` VARCHAR NOT NULL
- `generation_duration` INTEGER NOT NULL 
- `source_text_lemgth` TEXT NOT NULL CHECK (char_length(source_text) BETWEEN 1000 AND 10000)
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
- `updated_at` TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP

### Tabela `generation_error_logs`
- `id` BIGSERIAL PRIMARY KEY
- `user_id` UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT
- `model` VARCHAR NOT NULL
- `source_text_hash` VARCHAR NOT NULL
- `source_text_length` INTEGER NOT NULL CHECK (source_text_length BETWEEN 1000 AND 10000)
- `error_code` VARCHAR(100) NOT NULL
- `error_message` TEXT NOT NULL
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP

## 2. Relacje między tabelami
- Relacja 1:n: Jeden użytkownik (`users`) może posiadać wiele rekordów w tabelach `flashcards`, `generations` oraz `generation_error_logs`.
- Klucze obce na kolumnie `user_id` zapewniają integralność danych i są ustawione z mechanizmem `ON DELETE RESTRICT`.

</related_db_resources>

3. Definicje typów:
<type_definitions>
@types.ts
</type_definitions>

3. Tech stack:
<tech_stack>
@tech-stack.md
</tech_stack>

4. Implementation rules:
<implementation_rules>
@shared.mdc, @backend.mdc, @astro.mdc
</implementation_rules>

Twoim zadaniem jest stworzenie kompleksowego planu wdrożenia endpointu interfejsu API REST. Przed dostarczeniem ostatecznego planu użyj znaczników <analysis>, aby przeanalizować informacje i nakreślić swoje podejście. W tej analizie upewnij się, że:

1. Podsumuj kluczowe punkty specyfikacji API.
2. Wymień wymagane i opcjonalne parametry ze specyfikacji API.
3. Wymień niezbędne typy DTO i Command Modele.
4. Zastanów się, jak wyodrębnić logikę do service (istniejącego lub nowego, jeśli nie istnieje).
5. Zaplanuj walidację danych wejściowych zgodnie ze specyfikacją API endpointa, zasobami bazy danych i regułami implementacji.
6. Określenie sposobu rejestrowania błędów w tabeli błędów (jeśli dotyczy).
7. Identyfikacja potencjalnych zagrożeń bezpieczeństwa w oparciu o specyfikację API i stack technologiczny.
8. Nakreśl potencjalne scenariusze błędów i odpowiadające im kody stanu.

Po przeprowadzeniu analizy utwórz szczegółowy plan wdrożenia w formacie markdown. Plan powinien zawierać następujące sekcje:

1. Przegląd punktu końcowego
2. Szczegóły żądania
3. Szczegóły odpowiedzi
4. Przepływ danych
5. Względy bezpieczeństwa
6. Obsługa błędów
7. Wydajność
8. Kroki implementacji

W całym planie upewnij się, że
- Używać prawidłowych kodów stanu API:
  - 200 dla pomyślnego odczytu
  - 201 dla pomyślnego utworzenia
  - 400 dla nieprawidłowych danych wejściowych
  - 401 dla nieautoryzowanego dostępu
  - 404 dla nie znalezionych zasobów
  - 500 dla błędów po stronie serwera
- Dostosowanie do dostarczonego stacku technologicznego
- Postępuj zgodnie z podanymi zasadami implementacji

Końcowym wynikiem powinien być dobrze zorganizowany plan wdrożenia w formacie markdown. Oto przykład tego, jak powinny wyglądać dane wyjściowe:

``markdown
# API Endpoint Implementation Plan: [Nazwa punktu końcowego]

## 1. Przegląd punktu końcowego
[Krótki opis celu i funkcjonalności punktu końcowego]

## 2. Szczegóły żądania
- Metoda HTTP: [GET/POST/PUT/DELETE]
- Struktura URL: [wzorzec URL]
- Parametry:
  - Wymagane: [Lista wymaganych parametrów]
  - Opcjonalne: [Lista opcjonalnych parametrów]
- Request Body: [Struktura treści żądania, jeśli dotyczy]

## 3. Wykorzystywane typy
[DTOs i Command Modele niezbędne do implementacji]

## 3. Szczegóły odpowiedzi
[Oczekiwana struktura odpowiedzi i kody statusu]

## 4. Przepływ danych
[Opis przepływu danych, w tym interakcji z zewnętrznymi usługami lub bazami danych]

## 5. Względy bezpieczeństwa
[Szczegóły uwierzytelniania, autoryzacji i walidacji danych]

## 6. Obsługa błędów
[Lista potencjalnych błędów i sposób ich obsługi]

## 7. Rozważania dotyczące wydajności
[Potencjalne wąskie gardła i strategie optymalizacji]

## 8. Etapy wdrożenia
1. [Krok 1]
2. [Krok 2]
3. [Krok 3]
...
```

Końcowe wyniki powinny składać się wyłącznie z planu wdrożenia w formacie markdown i nie powinny powielać ani powtarzać żadnej pracy wykonanej w sekcji analizy.

Pamiętaj, aby zapisać swój plan wdrożenia jako .ai/flashcards-endpoint-implemntation-plan.md. Upewnij się, że plan jest szczegółowy, przejrzysty i zapewnia kompleksowe wskazówki dla zespołu programistów.