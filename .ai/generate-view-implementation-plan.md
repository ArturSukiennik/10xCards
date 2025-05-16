# Plan implementacji widoku generowania fiszek

## 1. Przegląd

Widok generowania fiszek to kluczowy element aplikacji 10xCards, który umożliwia użytkownikom szybkie tworzenie zestawów propozycji fiszek przy pomocy AI. Użytkownik może wprowadzić tekst źródłowy, a następnie otrzymać, przejrzeć i zmodyfikować wygenerowane propozycje fiszek przed ich zapisaniem. Na koniec może zapisać do bazy danych wszystkie bądź tylko zaakceptowane fiszki.

## 2. Routing widoku

- Ścieżka: `/generate`
- Dostęp tylko dla zalogowanych użytkowników
- Przekierowanie niezalogowanych użytkowników do strony logowania

## 3. Struktura komponentów

```
GenerateView (strona)
├── ErrorBoundary
│   └── ErrorAlert (shadcn/ui)
├── TextInputSection
│   ├── TextArea (shadcn/ui)
│   ├── ModelSelect (shadcn/ui)
│   ├── GenerateButton (shadcn/ui)
│   └── ValidationError (shadcn/ui)
├── GenerationProgress
│   └── LoadingSkeleton (shadcn/ui)
└── FlashcardsList
    ├── FlashcardItem
    │   ├── FlashcardPreview
    │   ├── FlashcardActions
    │   └── FlashcardError
    └── BatchActions
        ├── SaveAllButton (shadcn/ui)
        └── SaveAcceptedButton (shadcn/ui)
```

## 4. Szczegóły komponentów

### ErrorBoundary

- Opis: Komponent wysokiego poziomu do przechwytywania i wyświetlania błędów w aplikacji
- Główne elementy:
  - Alert z komunikatem błędu (shadcn/ui)
  - Przycisk do ponownej próby (jeśli możliwe)
- Obsługiwane interakcje:
  - Wyświetlanie szczegółów błędu
  - Ponowna próba wykonania akcji
  - Przekierowanie do strony głównej w przypadku krytycznych błędów
- Obsługiwana walidacja:
  - Sprawdzanie typu błędu
  - Określanie możliwości ponownej próby
- Typy: `ErrorBoundaryProps`, `ErrorBoundaryState`
- Propsy:
  ```typescript
  {
    fallback?: React.ReactNode;
    onReset?: () => void;
    children: React.ReactNode;
  }
  ```

### ValidationError

- Opis: Komponent do wyświetlania błędów walidacji w formularzu
- Główne elementy:
  - Alert z komunikatem błędu (shadcn/ui)
  - Lista błędów walidacji
- Obsługiwane interakcje:
  - Automatyczne przewijanie do błędu
  - Zamknięcie komunikatu
- Typy: `ValidationErrorProps`
- Propsy:
  ```typescript
  {
    errors: string[];
    onClose?: () => void;
  }
  ```

### FlashcardError

- Opis: Komponent do wyświetlania błędów związanych z pojedynczą fiszką
- Główne elementy:
  - Komunikat błędu inline
  - Wskazówki naprawy
- Obsługiwane interakcje:
  - Wyświetlanie szczegółów błędu
  - Automatyczne ukrywanie po poprawieniu błędu
- Typy: `FlashcardErrorProps`
- Propsy:
  ```typescript
  {
    error: string;
    field?: 'front' | 'back';
  }
  ```

### GenerateView

- Opis: Główny komponent widoku, zarządzający stanem generowania i koordynujący interakcje między komponentami
- Główne elementy:
  - Layout z nagłówkiem
  - Sekcje TextInputSection i FlashcardsList
  - Toast notifications (shadcn/ui) do wyświetlania komunikatów
- Obsługiwane interakcje:
  - Inicjowanie procesu generowania
  - Zarządzanie stanem ładowania
  - Obsługa błędów API
- Obsługiwana walidacja:
  - Sprawdzanie statusu autoryzacji
  - Walidacja stanu generowania
- Typy: `GenerateFlashcardsCommand`, `GenerateFlashcardsResponseDto`
- Propsy: brak (komponent na poziomie strony)

### TextInputSection

- Opis: Sekcja zawierająca formularz do wprowadzania tekstu źródłowego i konfiguracji generowania
- Główne elementy:
  - Textarea do wprowadzania tekstu
  - Select do wyboru modelu AI
  - Przycisk "Generuj"
  - Licznik znaków
- Obsługiwane interakcje:
  - Wprowadzanie tekstu
  - Wybór modelu
  - Inicjowanie generowania
- Obsługiwana walidacja:
  - Długość tekstu (1000-10000 znaków)
  - Dostępność wybranego modelu
- Typy: `GenerateFlashcardsCommand`
- Propsy:
  ```typescript
  {
    onGenerate: (command: GenerateFlashcardsCommand) => Promise<void>;
    isGenerating: boolean;
  }
  ```

### FlashcardsList

- Opis: Lista wygenerowanych propozycji fiszek z możliwością ich edycji i zatwierdzania
- Główne elementy:
  - Lista komponentów FlashcardItem
  - Sekcja akcji zbiorczych (BatchActions)
- Obsługiwane interakcje:
  - Zatwierdzanie/odrzucanie pojedynczych fiszek
  - Edycja fiszek
  - Zapisywanie wszystkich/zaakceptowanych fiszek
- Obsługiwana walidacja:
  - Stan zatwierdzenia każdej fiszki
  - Poprawność edytowanych treści
  - Możliwość wykonania akcji zbiorczych
- Typy: `TemporaryFlashcardDto`, `FlashcardSource`
- Propsy:
  ```typescript
  {
    flashcards: TemporaryFlashcardDto[];
    onSaveAll: () => Promise<void>;
    onSaveAccepted: () => Promise<void>;
    isSaving: boolean;
  }
  ```

### FlashcardItem

- Opis: Komponent pojedynczej fiszki z kontrolkami do edycji i zatwierdzania
- Główne elementy:
  - Podgląd przodu i tyłu fiszki
  - Przyciski akcji (zatwierdź, edytuj, odrzuć)
  - Formularz edycji
- Obsługiwane interakcje:
  - Przełączanie trybu edycji
  - Zatwierdzanie/odrzucanie
  - Edycja treści
- Obsługiwana walidacja:
  - Długość przodu (max 200 znaków)
  - Długość tyłu (max 600 znaków)
- Typy: `TemporaryFlashcardDto`, `FlashcardSource`
- Propsy:
  ```typescript
  {
    flashcard: TemporaryFlashcardDto;
    onUpdate: (id: string, updates: Partial<TemporaryFlashcardDto>) => void;
    onStatusChange: (id: string, status: 'accepted' | 'rejected') => void;
  }
  ```

### BatchActions

- Opis: Sekcja z przyciskami do operacji zbiorczych na wygenerowanych fiszkach
- Główne elementy:
  - Przycisk "Zapamiętaj wszystkie" (SaveAllButton)
  - Przycisk "Zapamiętaj zaakceptowane" (SaveAcceptedButton)
  - Wskaźnik postępu zapisywania
- Obsługiwane interakcje:
  - Zapisywanie wszystkich fiszek
  - Zapisywanie tylko zaakceptowanych fiszek
  - Wyświetlanie potwierdzenia sukcesu
  - Wyświetlanie błędów zapisu
- Obsługiwana walidacja:
  - Sprawdzanie czy są fiszki do zapisania
  - Weryfikacja poprawności fiszek przed zapisem
  - Blokada przycisków podczas zapisywania
- Typy: `BatchActionsProps`
- Propsy:
  ```typescript
  {
    flashcards: TemporaryFlashcardWithStatus[];
    onSaveAll: () => Promise<void>;
    onSaveAccepted: () => Promise<void>;
    isSaving: boolean;
  }
  ```

## 5. Typy

```typescript
// Stan widoku
interface GenerateViewState {
  sourceText: string;
  selectedModel: string;
  isGenerating: boolean;
  generationError: string | null;
  flashcards: FlashcardProposalViewModel[];
  generationId: number | null;
  errors: ErrorState | null;
  validationErrors: ValidationErrors[];
}

// Model propozycji fiszki
interface FlashcardProposalViewModel extends TemporaryFlashcardDto {
  status: "pending" | "accepted" | "rejected";
  isEditing: boolean;
  originalContent: {
    front: string;
    back: string;
  };
  hasBeenEdited: boolean;
}

// Mapowanie statusu na źródło fiszki
const flashcardSourceMapping = {
  accepted: {
    edited: FlashcardSource.AI_EDITED,
    notEdited: FlashcardSource.AI_FULL,
  },
} as const;

// Helper do określania źródła fiszki
function determineFlashcardSource(
  proposal: FlashcardProposalViewModel,
): FlashcardSource {
  if (proposal.status !== "accepted") {
    throw new Error("Cannot determine source for non-accepted flashcard");
  }
  return proposal.hasBeenEdited
    ? flashcardSourceMapping.accepted.edited
    : flashcardSourceMapping.accepted.notEdited;
}

// Typy dla obsługi błędów
interface ValidationErrors {
  field: string;
  message: string;
}

interface ErrorState {
  type: "validation" | "api" | "network" | "unknown";
  message: string;
  details?: ValidationErrors[];
  isRetryable: boolean;
}

// Formularz edycji fiszki
interface FlashcardEditForm {
  front: string;
  back: string;
}
```

## 6. Zarządzanie stanem

- Wykorzystanie React.useState dla lokalnego stanu komponentów
- Utworzenie customowego hooka useFlashcardGeneration:

  ```typescript
  function useFlashcardGeneration() {
    const [state, setState] = useState<GenerateViewState>({...});

    const generateFlashcards = async (command: GenerateFlashcardsCommand) => {...};

    const updateFlashcard = (id: string, updates: Partial<TemporaryFlashcardDto>) => {
      setState(prev => ({
        ...prev,
        flashcards: prev.flashcards.map(card =>
          card.id === id
            ? {
                ...card,
                ...updates,
                hasBeenEdited: true,
                isEditing: false
              }
            : card
        )
      }));
    };

    const updateFlashcardStatus = (id: string, status: 'accepted' | 'rejected') => {
      setState(prev => ({
        ...prev,
        flashcards: prev.flashcards.map(card =>
          card.id === id
            ? { ...card, status }
            : card
        )
      }));
    };

    const saveAllFlashcards = async () => {
      const flashcardsToSave = state.flashcards.map(proposal => ({
        front: proposal.front,
        back: proposal.back,
        source: proposal.status === 'accepted'
          ? determineFlashcardSource(proposal)
          : FlashcardSource.AI_FULL
      }));
      // ... reszta implementacji
    };

    const saveAcceptedFlashcards = async () => {
      const acceptedFlashcards = state.flashcards
        .filter(proposal => proposal.status === 'accepted')
        .map(proposal => ({
          front: proposal.front,
          back: proposal.back,
          source: determineFlashcardSource(proposal)
        }));
      // ... reszta implementacji
    };

    return {
      state,
      generateFlashcards,
      updateFlashcard,
      updateFlashcardStatus,
      saveAllFlashcards,
      saveAcceptedFlashcards
    };
  }
  ```

## 7. Integracja API

- Endpoint generowania: POST `/api/generations`
  - Request: `GenerateFlashcardsCommand`
  - Response: `GenerateFlashcardsResponseDto`
- Endpoint zapisywania: POST `/api/flashcards/batch`
  - Request: `CreateMultipleFlashcardsCommand`
  - Response: `CreateMultipleFlashcardsResponseDto`

## 8. Interakcje użytkownika

1. Wprowadzanie tekstu:

   - Aktualizacja licznika znaków w czasie rzeczywistym
   - Walidacja długości tekstu
   - Blokada przycisku "Generuj" gdy tekst jest niepoprawny

2. Generowanie fiszek:

   - Wyświetlenie loadera podczas generowania
   - Obsługa błędów API
   - Automatyczne przewijanie do listy wygenerowanych fiszek

3. Zarządzanie fiszkami:
   - Zatwierdzanie/odrzucanie pojedynczych fiszek
   - Edycja treści fiszek
   - Zapisywanie wszystkich fiszek
   - Zapisywanie tylko zaakceptowanych fiszek
   - Możliwość anulowania edycji
   - Blokada przycisków podczas zapisywania
   - Wyświetlanie potwierdzenia zapisania

## 9. Warunki i walidacja

1. Tekst źródłowy:

   - Minimum 1000 znaków
   - Maksimum 10000 znaków
   - Nie może być pusty

2. Fiszki:

   - Przód: maksymalnie 200 znaków
   - Tył: maksymalnie 600 znaków
   - Oba pola wymagane

3. Zapisywanie:
   - Przynajmniej jedna fiszka musi być zaakceptowana
   - Wszystkie zaakceptowane fiszki muszą być poprawne

## 10. Obsługa błędów

1. Błędy API:

   - Timeout połączenia
   - Błędy autoryzacji
   - Błędy walidacji
   - Błędy serwera
   - Wyświetlanie w ErrorAlert z możliwością ponownej próby

2. Błędy użytkownika:

   - Niepoprawna długość tekstu (ValidationError w TextInputSection)
   - Niepoprawna długość fiszek (FlashcardError w FlashcardItem)
   - Próba zapisu bez zaakceptowanych fiszek (ValidationError w BatchActions)
   - Natychmiastowa walidacja podczas wprowadzania danych

3. Obsługa stanu offline:

   - Zapisywanie stanu edycji w localStorage
   - Możliwość wznowienia sesji po utracie połączenia
   - Wyświetlanie komunikatu o braku połączenia

4. Hierarchia błędów:
   - Błędy krytyczne (ErrorBoundary) - problemy z renderowaniem
   - Błędy API (ErrorAlert) - problemy z komunikacją
   - Błędy walidacji (ValidationError) - problemy z danymi
   - Błędy fiszek (FlashcardError) - problemy z pojedynczymi fiszkami

## 11. Kroki implementacji

1. Utworzenie podstawowej struktury widoku i routingu
2. Implementacja komponentu TextInputSection z walidacją
3. Utworzenie hooka useFlashcardGeneration
4. Implementacja integracji z API generowania
5. Stworzenie komponentu FlashcardItem
6. Implementacja listy fiszek i akcji zbiorczych
7. Dodanie obsługi edycji fiszek
8. Implementacja zapisywania fiszek
9. Dodanie obsługi błędów i komunikatów
10. Implementacja mechanizmu autosave
11. Optymalizacja wydajności i UX
12. Testy i QA
