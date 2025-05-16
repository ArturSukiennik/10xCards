# Dokument wymagań produktu (PRD) - Fiszki AI

## 1. Przegląd produktu

Aplikacja Fiszki AI ma na celu umożliwienie efektywnego generowania wysokiej jakości fiszek edukacyjnych poprzez automatyczne przetwarzanie wprowadzonego tekstu. Produkt stanowi rozwiązanie problemu czasochłonnego tworzenia fiszek przez użytkowników, poprzez zastosowanie AI do generowania kandydatów, które następnie użytkownik recenzuje w prostym, intuicyjnym interfejsie. Produkt dedykowany jest początkowo dla platformy webowej, z możliwością dalszego rozwoju.

## 2. Problem użytkownika

Manualne tworzenie fiszek edukacyjnych jest czasochłonne i wymaga dużego wysiłku, co ogranicza efektywność nauki przy użyciu metody spaced repetition. Użytkownicy zmagają się z problemem standaryzacji i utrzymania wysokiej jakości fiszek, co skutkuje niską akceptacją i motywacją do regularnego korzystania z tego narzędzia.

## 3. Wymagania funkcjonalne

- Automatyczne generowanie fiszek przez AI na podstawie wprowadzonego tekstu (zakres 1000 - 10000 znaków), co umożliwia wygenerowanie od kilku do kilkunastu fiszek.
- Wyświetlanie pełnej listy kandydatów na fiszki, gdzie każda fiszka zawiera:
  - "przód" (maks. 200 znaków)
  - "tył" (maks. 600 znaków)
- Proces recenzji kandydatów:
  - Użytkownik przegląda listę kandydatów.
  - Dla każdej fiszki użytkownik wybiera jedną z opcji: zaakceptuj, edytuj lub odrzuć.
  - Po dokonaniu wyborów, użytkownik wykonuje bulk zapis, gdzie tylko zaakceptowane fiszki są zapisywane do bazy danych.
- Edycja fiszek:
  - Użytkownik ma możliwość modyfikacji obu pól ("przód" i "tył") podczas recenzji.
- Minimalistyczny interfejs użytkownika:
  - Formularz do generowania fiszek.
  - Lista kandydatów pod formularzem z natychmiastową informacją wizualną o dokonanych wyborach.
  - Podsumowanie decyzji przed bulk zapisem z możliwością przerwania całego procesu.
- Manualne tworzenie fiszek:
  - Umożliwienie tworzenia fiszek poprzez prosty modal/formularz.
- System kont użytkowników:
  - Prosty system rejestracji, logowania i zarządzania kontem w celu przechowywania fiszek.
- Integracja z gotowym algorytmem powtórek:
  - Po zapisaniu fiszek, integracja z zewnętrznym algorytmem powtórek w celu optymalizacji nauki.

## 4. Granice produktu

- Nie wchodzi w zakres stworzenie własnego, zaawansowanego algorytmu powtórek (np. SuperMemo, Anki).
- Produkt nie obsługuje importu fiszek z wielu formatów (PDF, DOCX itp.).
- Brak funkcjonalności współdzielenia zestawów fiszek między użytkownikami.
- Na początek wyłącznie platforma web, bez aplikacji mobilnych.
- Dalsze rozbudowanie zaawansowanych funkcji kont użytkowników i analizy danych pozostaje poza MVP.

## 5. Historyjki użytkowników

US-001
Tytuł: Generowanie fiszek przez AI
Opis: Jako użytkownik chcę wprowadzić tekst wejściowy do generacji fiszek, aby AI mogło automatycznie wygenerować kandydatów na fiszki.
Kryteria akceptacji:

- Użytkownik może wprowadzić tekst o długości od 1000 do 10000 znaków.
- System generuje listę kandydatów zgodnie z wprowadzonym tekstem.

US-002
Tytuł: Przeglądanie kandydatów na fiszki
Opis: Jako użytkownik chcę przeglądać pełną listę kandydatów na fiszki, aby ocenić ich jakość przed podjęciem decyzji.
Kryteria akceptacji:

- Lista zawiera pełne informacje dotyczące obu pól ("przód" i "tył").
- Każdy kandydat wyświetlany jest w sposób czytelny i przejrzysty.

US-003
Tytuł: Recenzja kandydatów na fiszki
Opis: Jako użytkownik chcę móc recenzować kandydatów poprzez wybór opcji "zaakceptuj", "edytuj" lub "odrzuć", aby zdecydować, które fiszki zostaną zapisane.
Kryteria akceptacji:

- Użytkownik ma do wyboru trzy opcje dla każdej fiszki.
- System natychmiast wizualnie sygnalizuje wybrane opcje.

US-004
Tytuł: Edycja kandydatów na fiszki
Opis: Jako użytkownik chcę mieć możliwość edytowania kandydatów na fiszki, aby móc poprawić ich zawartość przed zapisaniem.
Kryteria akceptacji:

- Użytkownik może edytować oba pola, "przód" i "tył".
- Zmiany są widoczne natychmiast w interfejsie recenzji.

US-005
Tytuł: Bulk zapis zaakceptowanych fiszek
Opis: Jako użytkownik chcę zatwierdzić bulk zapis wybranych kandydatów, aby wszystkie zaakceptowane fiszki zostały jednocześnie zapisane do bazy danych.
Kryteria akceptacji:

- Przed bulk zapisem wyświetlane jest podsumowanie decyzji.
- Użytkownik może przerwać cały proces przed zapisaniem (bez cofania pojedynczych decyzji).
- Wyłącznie zaakceptowane fiszki są zapisywane do bazy danych.
- System automatycznie odświeża listę kandydatów po zapisaniu.

US-006
Tytuł: Ręczne tworzenie fiszek
Opis: Jako użytkownik chcę móc ręcznie tworzyć fiszki poprzez prosty formularz, aby wprowadzać własne informacje, niezależnie od generacji AI.
Kryteria akceptacji:

- Formularz umożliwia ręczne wprowadzenie treści dla pola "przód" (do 200 znaków) oraz "tył" (do 600 znaków).
- Nowo utworzona fiszka zostaje zapisana i wyświetlona w liście fiszek.

US-007
Tytuł: Zarządzanie kontem użytkownika i bezpieczeństwo
Opis: Jako użytkownik chcę mieć możliwość rejestracji, logowania oraz zarządzania moim kontem, aby bezpiecznie przechowywać moje fiszki.
Kryteria akceptacji:

- System umożliwia rejestrację, logowanie i edycję danych konta.
- Mechanizmy zabezpieczeń chronią dane użytkownika.

US-008
Tytuł: Przegląd, wyszukiwanie i zarządzanie zapisanymi fiszkami
Opis: Jako użytkownik chcę przeglądać, wyszukiwać, edytować i usuwać zapisane fiszki, aby efektywnie zarządzać swoim zbiorem.
Kryteria akceptacji:

- Użytkownik ma dostęp do listy zapisanych fiszek.
- Istnieje możliwość edycji i usuwania poszczególnych fiszek.
- Funkcja wyszukiwania umożliwia szybkie lokalizowanie fiszek na podstawie treści.

## 6. Metryki sukcesu

- Co najmniej 75% fiszek generowanych przez AI musi zostać zaakceptowanych przez użytkownika.
- Użytkownicy powinni tworzyć minimum 75% swoich fiszek z wykorzystaniem funkcji generacji AI.
- Monitorowanie wskaźników sukcesu odbywa się poprzez analizę logów w dedykowanej tabeli bazy danych, w tym zbieranie numerycznych ocen fiszek (skala od 1 do 10).
