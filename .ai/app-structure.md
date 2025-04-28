Przeanalizuję strukturę projektu i przedstawię ją w formie diagramu ASCII. Najpierw sprawdzę dokładniej zawartość katalogów.

Ran tool

Ran tool

Ran tool
Na podstawie zebranych informacji, przedstawiam strukturę komponentów w formie diagramu ASCII:

```
@src/
├── components/
│   ├── generate/
│   │   ├── GenerateView.tsx         # Główny widok generowania fiszek
│   │   ├── TopBar.tsx              # Górny pasek nawigacji
│   │   ├── TextInputSection.tsx     # Sekcja wprowadzania tekstu
│   │   ├── FlashcardsList.tsx      # Lista wygenerowanych fiszek
│   │   └── FlashcardItem.tsx       # Pojedyncza fiszka
│   │
│   ├── auth/                       # Komponenty autoryzacji
│   │
│   ├── ui/                         # Komponenty UI (shadcn/ui)
│   │   ├── form.tsx               # Formularze
│   │   ├── card.tsx              # Karty
│   │   ├── button.tsx            # Przyciski
│   │   ├── input.tsx             # Pola wprowadzania
│   │   ├── textarea.tsx          # Obszary tekstu
│   │   ├── select.tsx            # Listy wyboru
│   │   ├── dialog.tsx            # Okna dialogowe
│   │   ├── alert.tsx             # Alerty
│   │   ├── error-alert.tsx       # Alerty błędów
│   │   ├── feedback.tsx          # Komponenty feedbacku
│   │   ├── navigation.tsx        # Nawigacja
│   │   ├── typography.tsx        # Typografia
│   │   ├── validation-error.tsx  # Błędy walidacji
│   │   ├── avatar.tsx            # Awatary
│   │   └── toaster.tsx           # Powiadomienia
│   │
│   └── SupabaseExample.astro      # Przykład integracji z Supabase
│
├── layouts/                        # Układy stron Astro
│
├── pages/                         # Strony Astro
│   └── api/                      # Endpointy API
│
├── middleware/                    # Middleware Astro
│
├── db/                           # Klienty i typy Supabase
│
├── lib/                          # Serwisy i helpery
│
└── types/                        # Typy współdzielone
```

Główne zależności między komponentami:

1. `GenerateView.tsx` (komponent nadrzędny)
   - Wykorzystuje `TopBar.tsx`
   - Wykorzystuje `TextInputSection.tsx`
   - Wykorzystuje `FlashcardsList.tsx`
     - FlashcardsList wykorzystuje `FlashcardItem.tsx`

2. Wszystkie komponenty mogą wykorzystywać podstawowe komponenty UI z katalogu `ui/`

3. Komponenty autoryzacji z katalogu `auth/` wykorzystują:
   - Komponenty UI z `ui/`
   - Integrację z Supabase

4. Komponenty UI z `ui/` są niezależnymi, podstawowymi blokami interfejsu użytkownika, które są wykorzystywane przez inne komponenty wyższego poziomu.

Ta struktura odzwierciedla architekturę modułową, gdzie komponenty są logicznie pogrupowane według ich funkcjonalności, z wyraźnym podziałem na komponenty UI, komponenty biznesowe (generate) oraz komponenty autoryzacji.
