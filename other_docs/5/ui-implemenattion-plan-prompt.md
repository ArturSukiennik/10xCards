Jako starszy programista frontendu Twoim zadaniem jest stworzenie szczegółowego planu wdrożenia nowego widoku w aplikacji internetowej. Plan ten powinien być kompleksowy i wystarczająco jasny dla innego programisty frontendowego, aby mógł poprawnie i wydajnie wdrożyć widok.

Najpierw przejrzyj następujące informacje:

1. Product Requirements Document (PRD):
<prd>
@prd.md
</prd>

2. Opis widoku:
<view_description>
 **Widok generowania fiszek**
  - Ścieżka: `/generate`
  - Główny cel: Umożliwienie użytkownikowi generowanie propozycji fiszek przez AI i ich rewizję (zaakceptuj, edytuj, odrzuć).
  - Kluczowe informacje: Pole tekstowe z ograniczeniem długości do wpropwadzenia tekstu. lista propozycji fiszek wygenerowanych przez AI, dropdown wyboru modelu, przycisk "Generuj", wskaźnik ładowania (spinner), przyciski akceptacji, edycji lub odrzucenia dla każdej fiszki.
  - Kluczowe komponenty: Edytor tekstu, dropdown, przycisk "Generuj fiszki", lista propozycji fiszek, przyciski akcji (zapisz wszystkie, zapisz zaakceptowane), komunikaty o błędach, wskaźnik ładowania (skeleton).
  - UX/dostępność: Intuicyjna walidacja wpisanego tekstu (od 1000 do 10 000 znaków), responsywność,   przejrzyste komunikaty błędów i wskaźniki postępu, automatyczne przewijanie do błędów.
</view_description>

3. User Stories:
<user_stories>
ID: US-003
Tytuł: Generowanie fiszek przy użyciu AI
Opis: Jako zalogowany użytkownik chcę wkleić kawałek tekstu i za pomocą przycisku wygenerować propozycje fiszek, aby zaoszczędzić czas na ręcznym tworzeniu pytań i odpowiedzi.
Kryteria akceptacji:
- W widoku generowania fiszek znajduje się pole tekstowe, w którym użytkownik może wkleić swój tekst.
- Pole tekstowe oczekuje od 1000 do 10 000 znaków.
- Po kliknięciu przycisku generowania aplikacja komunikuje się z API modelu LLM i wyświetla listę wygenerowanych propozycji fiszek do akceptacji przez użytkownika.
- W przypadku problemów z API lub braku odpowiedzi modelu użytkownik zobaczy stosowny komunikat o błędzie.
- Wygenerowana fiszka ma pola "Przód" (maksymalnie 200 znaków) i "Tył"(maksymalnie 600 znaków).

ID: US-004
Tytuł: Przegląd i zatwierdzanie propozycji fiszek
Opis: Jako zalogowany użytkownik chcę móc przeglądać wygenerowane fiszki i decydować, które z nich chcę dodać do mojego zestawu, aby zachować tylko przydatne pytania i odpowiedzi.
Kryteria akceptacji:
- Lista wygenerowanych fiszek jest wyświetlana pod formularzem generowania.
- Przy każdej fiszce znajduje się przycisk pozwalający na jej zatwierdzenie, edycję lub odrzucenie.
- Po zatwierdzeniu wybranych fiszek użytkownik może kliknąć przycisk zapisu i dodać je do bazy danych.

</user_stories>

4. Endpoint Description:
<endpoint_description>

#### Generate Flashcards
- Method: POST
- Path: `/generations`
- Description: Generate flashcards from text using LLM
- Request Payload:
  ```json
  {
    "source_text": "Lorem ipsum dolor sit amet...",
    "model": "gpt-4"
  }
  ```
- Response Payload:
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
- Success: 200 OK
- Errors:
  - 400 Bad Request (Invalid source text or model)
  - 401 Unauthorized (Not logged in)
  - 502 Bad Gateway (AI service unavailable)

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

</endpoint_description>

5. Endpoint Implementation:
<endpoint_implementation>
@generations.ts, @flashcards.ts
</endpoint_implementation>

6. Type Definitions:
<type_definitions>
@types.ts
</type_definitions>

7. Tech Stack:
<tech_stack>
@tech-stack.md
</tech_stack>

Przed utworzeniem ostatecznego planu wdrożenia przeprowadź analizę i planowanie wewnątrz tagów <implementation_breakdown> w swoim bloku myślenia. Ta sekcja może być dość długa, ponieważ ważne jest, aby być dokładnym.

W swoim podziale implementacji wykonaj następujące kroki:
1. Dla każdej sekcji wejściowej (PRD, User Stories, Endpoint Description, Endpoint Implementation, Type Definitions, Tech Stack):
  - Podsumuj kluczowe punkty
 - Wymień wszelkie wymagania lub ograniczenia
 - Zwróć uwagę na wszelkie potencjalne wyzwania lub ważne kwestie
2. Wyodrębnienie i wypisanie kluczowych wymagań z PRD
3. Wypisanie wszystkich potrzebnych głównych komponentów, wraz z krótkim opisem ich opisu, potrzebnych typów, obsługiwanych zdarzeń i warunków walidacji
4. Stworzenie wysokopoziomowego diagramu drzewa komponentów
5. Zidentyfikuj wymagane DTO i niestandardowe typy ViewModel dla każdego komponentu widoku. Szczegółowo wyjaśnij te nowe typy, dzieląc ich pola i powiązane typy.
6. Zidentyfikuj potencjalne zmienne stanu i niestandardowe hooki, wyjaśniając ich cel i sposób ich użycia
7. Wymień wymagane wywołania API i odpowiadające im akcje frontendowe
8. Zmapuj każdej historii użytkownika do konkretnych szczegółów implementacji, komponentów lub funkcji
9. Wymień interakcje użytkownika i ich oczekiwane wyniki
10. Wymień warunki wymagane przez API i jak je weryfikować na poziomie komponentów
11. Zidentyfikuj potencjalne scenariusze błędów i zasugeruj, jak sobie z nimi poradzić
12. Wymień potencjalne wyzwania związane z wdrożeniem tego widoku i zasugeruj możliwe rozwiązania

Po przeprowadzeniu analizy dostarcz plan wdrożenia w formacie Markdown z następującymi sekcjami:

1. Przegląd: Krótkie podsumowanie widoku i jego celu.
2. Routing widoku: Określenie ścieżki, na której widok powinien być dostępny.
3. Struktura komponentów: Zarys głównych komponentów i ich hierarchii.
4. Szczegóły komponentu: Dla każdego komponentu należy opisać:
 - Opis komponentu, jego przeznaczenie i z czego się składa
 - Główne elementy HTML i komponenty dzieci, które budują komponent
 - Obsługiwane zdarzenia
 - Warunki walidacji (szczegółowe warunki, zgodnie z API)
 - Typy (DTO i ViewModel) wymagane przez komponent
 - Propsy, które komponent przyjmuje od rodzica (interfejs komponentu)
5. Typy: Szczegółowy opis typów wymaganych do implementacji widoku, w tym dokładny podział wszelkich nowych typów lub modeli widoku według pól i typów.
6. Zarządzanie stanem: Szczegółowy opis sposobu zarządzania stanem w widoku, określenie, czy wymagany jest customowy hook.
7. Integracja API: Wyjaśnienie sposobu integracji z dostarczonym punktem końcowym. Precyzyjnie wskazuje typy żądania i odpowiedzi.
8. Interakcje użytkownika: Szczegółowy opis interakcji użytkownika i sposobu ich obsługi.
9. Warunki i walidacja: Opisz jakie warunki są weryfikowane przez interfejs, których komponentów dotyczą i jak wpływają one na stan interfejsu
10. Obsługa błędów: Opis sposobu obsługi potencjalnych błędów lub przypadków brzegowych.
11. Kroki implementacji: Przewodnik krok po kroku dotyczący implementacji widoku.

Upewnij się, że Twój plan jest zgodny z PRD, historyjkami użytkownika i uwzględnia dostarczony stack technologiczny.

Ostateczne wyniki powinny być w języku polskim i zapisane w pliku o nazwie .ai/{view-name}-view-implementation-plan.md. Nie uwzględniaj żadnej analizy i planowania w końcowym wyniku.

Oto przykład tego, jak powinien wyglądać plik wyjściowy (treść jest do zastąpienia):

```markdown
# Plan implementacji widoku [Nazwa widoku]

## 1. Przegląd
[Krótki opis widoku i jego celu]

## 2. Routing widoku
[Ścieżka, na której widok powinien być dostępny]

## 3. Struktura komponentów
[Zarys głównych komponentów i ich hierarchii]

## 4. Szczegóły komponentów
### [Nazwa komponentu 1]
- Opis komponentu [opis]
- Główne elementy: [opis]
- Obsługiwane interakcje: [lista]
- Obsługiwana walidacja: [lista, szczegółowa]
- Typy: [lista]
- Propsy: [lista]

### [Nazwa komponentu 2]
[...]

## 5. Typy
[Szczegółowy opis wymaganych typów]

## 6. Zarządzanie stanem
[Opis zarządzania stanem w widoku]

## 7. Integracja API
[Wyjaśnienie integracji z dostarczonym endpointem, wskazanie typów żądania i odpowiedzi]

## 8. Interakcje użytkownika
[Szczegółowy opis interakcji użytkownika]

## 9. Warunki i walidacja
[Szczegółowy opis warunków i ich walidacji]

## 10. Obsługa błędów
[Opis obsługi potencjalnych błędów]

## 11. Kroki implementacji
1. [Krok 1]
2. [Krok 2]
3. [...]
```

Rozpocznij analizę i planowanie już teraz. Twój ostateczny wynik powinien składać się wyłącznie z planu wdrożenia w języku polskim w formacie markdown, który zapiszesz w pliku .ai/{view-name}-view-implementation-plan.md i nie powinien powielać ani powtarzać żadnej pracy wykonanej w podziale implementacji.