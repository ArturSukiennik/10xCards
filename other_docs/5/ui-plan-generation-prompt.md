Jesteś wykwalifikowanym architektem frontend, którego zadaniem jest stworzenie kompleksowej architektury interfejsu użytkownika w oparciu o dokument wymagań produktu (PRD), plan API i notatki z sesji planowania. Twoim celem jest zaprojektowanie struktury interfejsu użytkownika, która skutecznie spełnia wymagania produktu, jest zgodna z możliwościami API i zawiera spostrzeżenia z sesji planowania.

Najpierw dokładnie przejrzyj następujące dokumenty:

Dokument wymagań produktu (PRD):
<prd>
@prd.md
</prd>

Plan API:
<api_plan>
@api-plan.md
</api_plan>

Session Notes:
<session_notes>
<conversation_summary>
<decisions>

1. System powiadomień zostanie zaimplementowany w późniejszej fazie, nie w MVP
2. Statystyki generowania fiszek będą prezentowane jako prosty wskaźnik akceptacji/odrzucenia
3. Użytkownik będzie miał możliwość wyboru modelu AI w widoku generowania
4. Stan ładowania będzie prezentowany w najprostszy możliwy sposób (spinner)
5. Edycja fiszek będzie możliwa tylko pojedynczo
6. "Generowanie fiszek" i "Moje fiszki" będą osobnymi zakładkami
7. Prezentacja historii ograniczy się do liczby wygenerowanych fiszek
8. Błędy API będą pokazywane w czerwonych chmurkach przy kontrolkach
9. System tagów zostanie zaimplementowany później
10. Wskaźnik akceptacji będzie pokazywany w formacie "akceptacje w sesji/liczba globalna"
11. Lista "Moje fiszki" będzie wyświetlać 10 fiszek na stronę (stała wartość w MVP)
12. Liczniki pozostałych znaków będą zawsze widoczne
13. Edycja fiszek będzie realizowana w modalu
14. Data utworzenia będzie wyświetlana przy każdej fiszce
15. Dropdown modeli AI będzie zawierać tylko nazwy modeli
16. Usuwanie fiszek zawsze będzie wymagać potwierdzenia
17. Komunikaty błędów będą ogólne, bez szczegółów technicznych
18. Przekroczenie limitu znaków będzie skutkować automatycznym przycinaniem tekstu
    </decisions>

<matched_recommendations>

1. Interfejs generowania fiszek:

   - Pole tekstowe z walidacją
   - Prosty dropdown wyboru modelu AI
   - Przycisk "Generuj" (aktywny/nieaktywny)
   - Podstawowy spinner podczas ładowania

2. System prezentacji wygenerowanych fiszek:

   - Lista do akceptacji/odrzucenia
   - Wskaźnik "X/Y" aktualizowany na żywo
   - Zachowanie tekstu przy błędach
   - Automatyczne przewijanie do błędów

3. Widok "Moje fiszki":

   - 10 fiszek na stronę
   - Sortowanie po dacie utworzenia
   - Skrócony podgląd treści
   - Przyciski szybkiej edycji
   - Data utworzenia

4. Modal edycji fiszki:

   - Pola z licznikami znaków
   - Przyciski "Zapisz" i "Anuluj"
   - Informacja o źródle (AI/manual)
   - Automatyczne przycinanie tekstu
   - Walidacja bez blokady modalu

5. System komunikatów:
   - Czerwone chmurki przy błędach
   - Potwierdzenia usunięcia
   - Ogólne komunikaty błędów
   - Informacje o sukcesie

</matched_recommendations>

<ui_architecture_planning_summary>

1. Główne wymagania UI:

   - Minimalistyczny, intuicyjny interfejs
   - Dwie główne zakładki nawigacyjne
   - Szybka edycja i podgląd fiszek
   - Prosty system statystyk
   - Podstawowa walidacja danych

2. Kluczowe widoki i przepływy:
   a) Generowanie fiszek:

   - Wprowadzanie tekstu
   - Wybór modelu AI
   - Akceptacja/odrzucanie propozycji
   - Wskaźnik postępu

   b) Zarządzanie fiszkami:

   - Lista z paginacją
   - Modal edycji
   - Potwierdzenie usunięcia
   - Szybki podgląd

3. Integracja z API:

   - Obsługa błędów przez chmurki
   - Zachowanie stanu przy błędach
   - Podstawowe wskaźniki ładowania
   - Automatyczna walidacja limitów

4. Responsywność i dostępność:

   - Dostosowanie do różnych ekranów
   - Czytelne komunikaty błędów
   - Intuicyjna nawigacja
   - Optymalizacja pod urządzenia mobilne

5. Zarządzanie stanem:
   - Przechowywanie tekstu źródłowego
   - Pamięć wybranego modelu AI
   - Stan formularzy
   - Obsługa historii przeglądarki

</ui_architecture_planning_summary>

<unresolved_issues>

1. Szczegółowy wygląd spinnera podczas ładowania
2. Dokładny format skróconego podglądu treści fiszek
3. Sposób prezentacji statystyk na urządzeniach mobilnych
4. Szczegółowy wygląd czerwonych chmurek z błędami
5. Dokładna treść komunikatów potwierdzenia usunięcia
   </unresolved_issues>
   </conversation_summary>

</session_notes>

Twoim zadaniem jest stworzenie szczegółowej architektury interfejsu użytkownika, która obejmuje niezbędne widoki, mapowanie podróży użytkownika, strukturę nawigacji i kluczowe elementy dla każdego widoku. Projekt powinien uwzględniać doświadczenie użytkownika, dostępność i bezpieczeństwo.

Wykonaj następujące kroki, aby ukończyć zadanie:

1. Dokładnie przeanalizuj PRD, plan API i notatki z sesji.
2. Wyodrębnij i wypisz kluczowe wymagania z PRD.
3. Zidentyfikuj i wymień główne punkty końcowe API i ich cele.
4. Utworzenie listy wszystkich niezbędnych widoków na podstawie PRD, planu API i notatek z sesji.
5. Określenie głównego celu i kluczowych informacji dla każdego widoku.
6. Zaplanuj podróż użytkownika między widokami, w tym podział krok po kroku dla głównego przypadku użycia.
7. Zaprojektuj strukturę nawigacji.
8. Zaproponuj kluczowe elementy interfejsu użytkownika dla każdego widoku, biorąc pod uwagę UX, dostępność i bezpieczeństwo.
9. Rozważ potencjalne przypadki brzegowe lub stany błędów.
10. Upewnij się, że architektura interfejsu użytkownika jest zgodna z planem API.
11. Przejrzenie i zmapowanie wszystkich historyjek użytkownika z PRD do architektury interfejsu użytkownika.
12. Wyraźne mapowanie wymagań na elementy interfejsu użytkownika.
13. Rozważ potencjalne punkty bólu użytkownika i sposób, w jaki interfejs użytkownika je rozwiązuje.

Dla każdego głównego kroku pracuj wewnątrz tagów <ui_architecture_planning> w bloku myślenia, aby rozbić proces myślowy przed przejściem do następnego kroku. Ta sekcja może być dość długa. To w porządku, że ta sekcja może być dość długa.

Przedstaw ostateczną architekturę interfejsu użytkownika w następującym formacie Markdown:

```markdown
# Architektura UI dla [Nazwa produktu]

## 1. Przegląd struktury UI

[Przedstaw ogólny przegląd struktury UI]

## 2. Lista widoków

[Dla każdego widoku podaj:

- Nazwa widoku
- Ścieżka widoku
- Główny cel
- Kluczowe informacje do wyświetlenia
- Kluczowe komponenty widoku
- UX, dostępność i względy bezpieczeństwa]

## 3. Mapa podróży użytkownika

[Opisz przepływ między widokami i kluczowymi interakcjami użytkownika]

## 4. Układ i struktura nawigacji

[Wyjaśnij, w jaki sposób użytkownicy będą poruszać się między widokami]

## 5. Kluczowe komponenty

[Wymień i krótko opisz kluczowe komponenty, które będą używane w wielu widokach].
```

Skup się wyłącznie na architekturze interfejsu użytkownika, podróży użytkownika, nawigacji i kluczowych elementach dla każdego widoku. Nie uwzględniaj szczegółów implementacji, konkretnego projektu wizualnego ani przykładów kodu, chyba że są one kluczowe dla zrozumienia architektury.

Końcowy rezultat powinien składać się wyłącznie z architektury UI w formacie Markdown w języku polskim, którą zapiszesz w pliku .ai/ui-plan.md. Nie powielaj ani nie powtarzaj żadnej pracy wykonanej w bloku myślenia.
