# Architektura UI dla 10xCards

## 1. Przegląd struktury UI
Architektura UI aplikacji 10xCards opiera się na minimalistycznym, intuicyjnym i responsywnym interfejsie, który umożliwia łatwe generowanie, przegląd i zarządzanie fiszkami. Główne zasady to przejrzystość, dostępność oraz bezpieczeństwo, z uwzględnieniem walidacji danych i obsługi błędów. Interfejs wspiera integrację z API, zapewniając spójne doświadczenie użytkownika zarówno na desktopie, jak i urządzeniach mobilnych.

## 2. Lista widoków
- **Widok logowania/rejestracji**
  - Ścieżka: `/login` oraz `/register`
  - Główny cel: Umożliwienie użytkownikom autoryzacji i tworzenia kont.
  - Kluczowe informacje: Formularze z polami na e-mail i hasło, informacja o błędach, potwierdzenie rejestracji lub logowania.
  - Kluczowe komponenty: Pola formularza, przyciski submit, komunikaty błędów.
  - UX/dostępność: Jasny układ formularzy, czytelne etykiety, walidacja w czasie rzeczywistym.

- **Widok generowania fiszek**
  - Ścieżka: `/generate`
  - Główny cel: Umożliwienie użytkownikowi wprowadzenia tekstu oraz wyboru modelu AI do autogeneracji fiszek.
  - Kluczowe informacje: Pole tekstowe z ograniczeniem długości, dropdown wyboru modelu, przycisk "Generuj", wskaźnik ładowania (spinner).
  - Kluczowe komponenty: Edytor tekstu, dropdown, przycisk wyzwalający akcję, lista propozycji fiszek.
  - UX/dostępność: Intuicyjna walidacja wpisanego tekstu (od 1000 do 10 000 znaków), przejrzyste komunikaty błędów i wskaźniki postępu, automatyczne przewijanie do błędów.

- **Widok "Moje fiszki"**
  - Ścieżka: `/my-flashcards`
  - Główny cel: Przegląd, edycja oraz usuwanie zapisanych fiszek.
  - Kluczowe informacje: Lista fiszek (10 na stronę), data utworzenia, skrócony podgląd treści.
  - Kluczowe komponenty: Lista fiszek, przyciski do edycji i usuwania, paginacja, komunikaty potwierdzenia.
  - UX/dostępność: Prosty, czytelny layout, modal do edycji fiszek, wymaganie potwierdzenia przy usuwaniu, responsywny design.

- **Widok sesji nauki**
  - Ścieżka: `/learning-session`
  - Główny cel: Umożliwienie użytkownikowi rozpoczęcia sesji nauki z wykorzystaniem algorytmu powtórek.
  - Kluczowe informacje: Prezentacja fiszki, przycisk ujawniający odpowiedź, opcje oceny przyswojenia.
  - Kluczowe komponenty: Komponent prezentujący fiszkę, przyciski oceny, elementy nawigacyjne do kolejnej fiszki.
  - UX/dostępność: Intuicyjna interakcja, natychmiastowa informacja zwrotna, duże przyciski ułatwiające obsługę na urządzeniach mobilnych.

- **Modal edycji fiszki**
  - Ścieżka: Wywoływany na żądanie w widoku "Moje fiszki"
  - Główny cel: Umożliwienie modyfikacji wybranej fiszki.
  - Kluczowe informacje: Pola do edycji treści fiszki, licznik pozostałych znaków, informacja o źródle (AI/manual).
  - Kluczowe komponenty: Modal z formularzem edycji, przyciski "Zapisz" i "Anuluj", komunikaty walidacyjne.
  - UX/dostępność: Intuicyjna edycja bez opuszczania głównego widoku, natychmiastowa walidacja, automatyczne przycinanie tekstu.

## 3. Mapa podróży użytkownika
1. Użytkownik rozpoczyna od widoku logowania/rejestracji, gdzie tworzy konto lub loguje się do systemu.
2. Po zalogowaniu użytkownik trafia do widoku generowania fiszek, gdzie wprowadza tekst i wybiera model AI.
3. Po uruchomieniu procesu generacji, system wyświetla spinner i następnie listę proponowanych fiszek do akceptacji.
4. Użytkownik dokonuje wyboru: akceptuje, edytuje (otwierając modal) lub odrzuca poszczególne fiszki.
5. Po zatwierdzeniu wybiera, zapisuje fiszki, które trafiają do widoku "Moje fiszki".
6. W widoku "Moje fiszki" użytkownik przegląda listę zapisanych fiszek, dokonuje edycji lub usuwa wybrane karty.
7. Alternatywnie, użytkownik może przejść do widoku sesji nauki, aby rozpocząć iteracyjną naukę za pomocą algorytmu powtórek.
8. Nawigacja pomiędzy widokami odbywa się za pomocą głównego menu oraz wewnętrznych przycisków akcji.

## 4. Układ i struktura nawigacji
Interfejs będzie korzystał z głównego menu dostępnego na wszystkich stronach, które zawiera:
- Link do widoku generowania fiszek (domyślny widok po zalogowaniu).
- Link do widoku "Moje fiszki", umożliwiający przegląd i zarządzanie zapisanymi fiszkami.
- Link do widoku sesji nauki, umożliwiający rozpoczęcie nauki.
- Link do profilu, umożliwiający zarządzanie kontem i dostęp do ustawień.
- Opcję wylogowania, umożliwiającą bezproblemowe zakończenie sesji.

Nawigacja została zaprojektowana tak, aby umożliwić bezproblemowe przechodzenie między widokami, zachowując kontekst użytkownika i jego dane sesyjne. Dzięki temu po każdej zmianie widoku stan aplikacji jest utrzymywany, co pozwala użytkownikowi na płynne korzystanie z funkcjonalności aplikacji bez utraty wprowadzonych danych.

Menu będzie responsywne, dostosowujące się do urządzeń mobilnych poprzez rozwijane menu oraz ikonki, co zapewni intuicyjną nawigację zarówno na desktopie, jak i na urządzeniach mobilnych.

## 5. Kluczowe komponenty
- **Formularz generowania fiszek:** Pole tekstowe z walidacją, dropdown wyboru modelu AI, przycisk "Generuj" oraz wskaźnik ładowania (spinner).
- **Lista fiszek:** Dynamicznie generowana lista fiszek z opcjami akceptacji, edycji i usuwania, z paginacją.
- **Modal edycji:** Okno modalne umożliwiające edycję fiszki, wyposażone w licznik znaków, przyciski "Zapisz" i "Anuluj" oraz walidację formularza.
- **System powiadomień:** Mechanizm wyświetlania komunikatów o błędach (czerwone chmurki), potwierdzeń operacji oraz informacji o sukcesie.
- **Komponent sesji nauki:** Interaktywny moduł prezentujący fiszki, umożliwiający ocenę przyswojenia treści oraz automatyczny przepływ między kolejnymi fiszkami.
- **Główne menu nawigacyjne:** Pasek menu umożliwiający łatwe przełączanie się między widokami, dostosowany do różnych rozdzielczości ekranu. 