# API Endpoint Implementation Plan: Generate Flashcards

## 1. Przegląd punktu końcowego
Endpoint `/generations` służy do automatycznego generowania fiszek z tekstu źródłowego przy użyciu modeli językowych (LLM). Użytkownicy mogą przesłać tekst, który zostanie przetworzony przez wybrany model AI w celu utworzenia zestawu fiszek edukacyjnych. Każda wygenerowana fiszka będzie zawierać pytanie (front) i odpowiedź (back).

## 2. Szczegóły żądania
- Metoda HTTP: POST
- Struktura URL: `/generations`
- Parametry:
  - Wymagane: Brak (parametry są przesyłane w ciele żądania)
  - Opcjonalne: Brak
- Request Body:
  ```json
  {
    "source_text": "Lorem ipsum dolor sit amet...",
    "model": "gpt-4"
  }
  ```
  - `source_text`: Tekst źródłowy, z którego mają zostać wygenerowane fiszki (między 1000 a 10000 znaków)
  - `model`: Identyfikator modelu AI do wykorzystania (np. "gpt-4")

## 3. Wykorzystywane typy
- `GenerateFlashcardsCommand`: Command model z polami `source_text` i `model`
- `TemporaryFlashcardDto`: DTO reprezentujące tymczasową fiszkę przed zapisaniem (zawiera `temp_id`, `front` i `back`)
- `GenerateFlashcardsResponseDto`: DTO odpowiedzi zawierające `generation_id` i tablicę `generated_flashcards`

## 4. Szczegóły odpowiedzi
- Kod statusu: 200 OK (sukces)
- Format odpowiedzi:
  ```json
  {
    "generation_id": 123,
    "generated_flashcards": [
      {
        "id": "temp_1",
        "front": "What is Lorem Ipsum?",
        "back": "Lorem Ipsum is simply dummy text..."
      },
      {
        "id": "temp_2",
        "front": "Where does Lorem Ipsum come from?",
        "back": "Lorem Ipsum comes from sections..."
      }
    ]
  }
  ```
- Kody błędów:
  - 400 Bad Request: Nieprawidłowy tekst źródłowy lub model
  - 401 Unauthorized: Użytkownik niezalogowany
  - 502 Bad Gateway: Usługa AI niedostępna

## 5. Przepływ danych
1. **Przyjęcie żądania**:
   - Żądanie HTTP POST trafia do endpointu `/generations`.
   - Ciało żądania w formacie JSON jest deserializowane do obiektu typu `GenerateFlashcardsCommand`.
   - Nagłówki uwierzytelniające z tokenem JWT Supabase są ekstrahowane do dalszej weryfikacji.

2. **Uwierzytelnianie i autoryzacja**:
   - Middleware Supabase weryfikuje token JWT i ustala tożsamość użytkownika.
   - Z tokenu JWT pobierany jest `user_id` (UUID użytkownika).
   - Jeśli token jest nieprawidłowy lub wygasł, zwracany jest kod błędu 401 Unauthorized.

3. **Walidacja danych wejściowych**:
   - Walidacja pola `source_text`:
     - Sprawdzenie czy tekst istnieje (nie jest pusty).
     - Weryfikacja długości tekstu (między 1000 a 10000 znaków).
     - Sanityzacja tekstu w celu usunięcia potencjalnie niebezpiecznych elementów.
   - Walidacja pola `model`:
     - Sprawdzenie czy model istnieje na liście obsługiwanych modeli.
     - Weryfikacja czy wybrany model jest dostępny (nie jest w trakcie konserwacji).
   - W przypadku błędów walidacji, zwracany jest kod 400 Bad Request z odpowiednim komunikatem.

4. **Utworzenie rekordu generacji w bazie danych**:
   - Obliczenie hasha tekstu źródłowego (`source_text_hash`).
   - Zapis początkowego stanu generacji w tabeli `generations`:
     ```sql
     INSERT INTO generations 
     (user_id, model, generated_count, source_text_hash, source_text_length, generation_duration, created_at, updated_at) 
     VALUES 
     (:user_id, :model, 0, :source_text_hash, LENGTH(:source_text), 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
     RETURNING id;
     ```
   - Pobranie `generation_id` nowo utworzonego rekordu do późniejszego wykorzystania.
   - Rozpoczęcie pomiaru czasu generacji.

5. **Komunikacja z API modelu językowego**:
   - Przygotowanie zapytania do API modelu językowego:
     - Formatowanie tekstu źródłowego.
     - Dodanie instrukcji dla modelu określających format oczekiwanych fiszek.
     - Ustawienie parametrów generacji (temperatura, max_tokens itp.).
   - Wykonanie asynchronicznego żądania do API modelu (np. OpenAI, Anthropic).
   - W przypadku błędu API (np. przekroczenie limitu, niedostępność):
     - Zapisanie błędu w tabeli `generation_error_logs`.
     - Usunięcie wcześniej utworzonego rekordu z tabeli `generations` lub oznaczenie go jako nieudany.
     - Zwrócenie kodu błędu 502 Bad Gateway z informacją o problemie.

6. **Przetwarzanie odpowiedzi modelu**:
   - Parsowanie tekstowej odpowiedzi modelu do struktury fiszek.
   - Weryfikacja poprawności wygenerowanych fiszek:
     - Sprawdzenie czy każda fiszka ma wymagane pola (`front` i `back`).
     - Weryfikacja długości pól (front <= 200 znaków, back <= 500 znaków).
   - Każdej fiszce przypisywany jest tymczasowy identyfikator (`temp_id`).
   - Konwersja do tablicy obiektów typu `TemporaryFlashcardDto`.
   - Zakończenie pomiaru czasu generacji.

7. **Aktualizacja rekordu generacji**:
   - Aktualizacja rekordu w tabeli `generations` o dane statystyczne:
     ```sql
     UPDATE generations
     SET generated_count = :generated_count,
         generated_unedited_count = :generated_count,
         generation_duration = :duration_ms,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = :generation_id;
     ```
   - Gdzie:
     - `generated_count` to liczba wygenerowanych fiszek.
     - `duration_ms` to zmierzony czas generacji w milisekundach.

8. **Przygotowanie odpowiedzi**:
   - Konstrukcja obiektu odpowiedzi typu `GenerateFlashcardsResponseDto`:
     ```typescript
     {
       generation_id: number; // ID z tabeli generations
       generated_flashcards: TemporaryFlashcardDto[]; // Tablica wygenerowanych fiszek
     }
     ```
   - Serializacja odpowiedzi do formatu JSON.
   - Zwrócenie odpowiedzi z kodem 200 OK.

9. **Obsługa wątku asynchronicznego (opcjonalnie)**:
   - Jeśli implementacja używa przetwarzania asynchronicznego:
     - Klient otrzymuje natychmiastową odpowiedź z identyfikatorem zadania.
     - Generacja fiszek odbywa się w tle.
     - Klient może sprawdzać status generacji przez oddzielny endpoint.
     - Po zakończeniu generacji, wyniki są dostępne do pobrania.

## 6. Względy bezpieczeństwa
- **Uwierzytelnianie**: Konieczne sprawdzenie, czy użytkownik jest zalogowany poprzez middleware Supabase.
- **Autoryzacja**: Żądania muszą zawierać ważny token JWT, który jest weryfikowany przez Supabase.
- **Walidacja danych wejściowych**:
  - Sprawdzenie długości tekstu źródłowego (1000-10000 znaków).
  - Weryfikacja, czy wybrany model jest dozwolony i dostępny.
  - Sanityzacja danych wejściowych przed wysłaniem do API modelu.
- **Rate limiting**: Ograniczenie liczby żądań na użytkownika, aby zapobiec nadużyciom.
- **Zabezpieczenia treści**: Filtrowanie potencjalnie niebezpiecznych treści przed wysłaniem do API modelu.
- **Kontrola kosztów**: Monitorowanie zużycia tokenów API, aby zapobiec nieoczekiwanym kosztom.

## 7. Obsługa błędów
- **Nieprawidłowe dane wejściowe** (400 Bad Request):
  - Tekst źródłowy poza zakresem długości.
  - Nieobsługiwany model AI.
  - Brak wymaganych pól w żądaniu.
- **Problemy z uwierzytelnianiem** (401 Unauthorized):
  - Brak tokenu JWT lub token wygasł.
  - Użytkownik niezalogowany.
- **Błędy serwisu AI** (502 Bad Gateway):
  - Błąd komunikacji z API modelu.
  - Przekroczenie limitu API.
  - Nieprawidłowa odpowiedź z API modelu.
- **Wewnętrzne błędy serwera** (500 Internal Server Error):
  - Błędy bazy danych.
  - Nieoczekiwane wyjątki.

Wszystkie błędy powinny być logowane w tabeli `generation_error_logs` z odpowiednimi informacjami, takimi jak `user_id`, `model`, `source_text_hash`, `source_text_length`, `error_code` i `error_message`.

## 8. Rozważania dotyczące wydajności
- **Asynchroniczne przetwarzanie**: Generowanie fiszek może być czasochłonne. Implementacja kolejki zadań może poprawić responsywność.
- **Timeout dla wywołania AI**: 60 sekund na oczekiwanie na odpowiedź od AI, po tym czasie leci timeout.

## 9. Etapy wdrożenia
1. **Przygotowanie infrastruktury**:
   - Skonfiguruj połączenie z wybranym API modelu językowego.
   - Upewnij się, że tabele bazy danych są gotowe (sprawdź zwłaszcza `generations` i `generation_error_logs`).

2. **Implementacja warstwy DTO**:
   - Upewnij się, że wszystkie wymagane typy są zdefiniowane w `types.ts`.

3. **Implementacja walidacji danych wejściowych**:
   - Zaimplementuj middleware do walidacji tekstu źródłowego i modelu.
   - Przygotuj obsługę błędów walidacji z odpowiednimi komunikatami.

4. **Implementacja serwisu generowania fiszek**:
   - Stwórz serwis obsługujący komunikację z API modelu językowego(`generation.service`).
   - Zaimplementuj logikę przetwarzania odpowiedzi i formatowania fiszek.

5. **Implementacja trwałości danych**:
   - Stwórz funkcje do zapisywania informacji o generacji w bazie danych.
   - Zaimplementuj logikę aktualizacji statystyk generacji.

6. **Implementacja logowania błędów**:
   - Przygotuj mechanizm logowania błędów do tabeli `generation_error_logs`.

7. **Implementacja endpointu**:
   - Zaimplementuj handler endpointu `/generations` w Astro API.
   - Połącz wszystkie wcześniej zaimplementowane komponenty.

8. **Testowanie**:
   - Przeprowadź testy jednostkowe dla logiki biznesowej.
   - Przetestuj endpoint z różnymi scenariuszami (sukces, błędy walidacji, błędy AI).
   - Wykonaj testy wydajnościowe dla dużych tekstów źródłowych.

9. **Wdrożenie i dokumentacja**:
   - Wdróż endpoint na środowisko produkcyjne.
   - Udokumentuj API dla frontendowych developerów.
   - Monitoruj działanie endpointu po wdrożeniu.