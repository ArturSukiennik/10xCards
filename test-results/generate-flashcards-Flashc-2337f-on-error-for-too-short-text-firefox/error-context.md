# Test info

- Name: Flashcard Generation >> should show validation error for too short text
- Location: C:\AI\10xDevs\10xCardsRepo\tests\e2e\generate-flashcards.spec.ts:90:3

# Error details

```
Error: expect(received).toContain(expected) // indexOf

Expected value: StringContaining "must be at least 1000 characters"
Received array: []
    at C:\AI\10xDevs\10xCardsRepo\tests\e2e\generate-flashcards.spec.ts:100:36
```

# Page snapshot

```yaml
- main:
  - text: 10xCards test@test.com
  - button "Logout":
    - img
    - text: Logout
  - heading "Generate Flashcards" [level=1]
  - heading "Enter Your Text" [level=2]
  - text: 26/10000 characters
  - textbox "Paste your text here (minimum 100 characters)": To jest zbyt krótki tekst.
  - combobox: gpt-4o-mini
  - button "Generate Flashcards" [disabled]
- region "Notifications alt+T"
```

# Test source

```ts
   1 | import { expect } from "@playwright/test";
   2 | import { test } from "./setup/test-setup";
   3 | import { GenerateViewPage } from "./pages/GenerateView.page";
   4 | import { AuthUtils } from "./utils/auth";
   5 |
   6 | test.describe("Flashcard Generation", () => {
   7 |   let generateView: GenerateViewPage;
   8 |   let authUtils: AuthUtils;
   9 |
   10 |   // Przykładowy tekst w języku polskim (około 2000 znaków)
   11 |   const samplePolishText = `
   12 |     Historia Polski jest niezwykle bogata i fascynująca. Państwo polskie powstało ponad tysiąc lat temu,
   13 |     a jego początki sięgają czasów Mieszka I z dynastii Piastów. To właśnie on w 966 roku przyjął chrzest,
   14 |     wprowadzając Polskę do kręgu kultury chrześcijańskiej i europejskiej. Jego syn, Bolesław Chrobry,
   15 |     został pierwszym królem Polski w 1025 roku.
   16 |
   17 |     Przez wieki Polska przechodziła różne okresy - od potęgi za czasów Jagiellonów, przez trudne momenty
   18 |     rozbiorów, aż po odrodzenie w 1918 roku. Szczególnie istotny był okres złotego wieku w XVI stuleciu,
   19 |     kiedy to Polska była jednym z największych i najsilniejszych państw w Europie. W tym czasie rozkwitała
   20 |     kultura, sztuka i nauka, a Kraków stał się jednym z najważniejszych ośrodków renesansu na północ od Alp.
   21 |
   22 |     Wiek XVII przyniósł szereg wojen i stopniowe osłabienie państwa. Mimo to Polska wciąż odgrywała istotną
   23 |     rolę w Europie, czego przykładem była odsiecz wiedeńska Jana III Sobieskiego w 1683 roku. Jednak już
   24 |     w XVIII wieku nastąpił upadek Rzeczypospolitej, zakończony rozbiorami przez Rosję, Prusy i Austrię.
   25 |
   26 |     Okres zaborów trwał 123 lata, ale Polacy nigdy nie stracili ducha walki o niepodległość. Powstania
   27 |     narodowe - kościuszkowskie, listopadowe i styczniowe - mimo że zakończone klęskami, podtrzymywały
   28 |     świadomość narodową i wolę odzyskania niepodległości. W tym czasie wielką rolę odegrała polska kultura,
   29 |     szczególnie literatura romantyczna z takimi twórcami jak Adam Mickiewicz czy Juliusz Słowacki.
   30 |
   31 |     Polska odzyskała niepodległość w 1918 roku, po zakończeniu I wojny światowej. Okres międzywojenny
   32 |     był czasem odbudowy państwowości i rozwoju gospodarczego, przerwany jednak przez wybuch II wojny
   33 |     światowej w 1939 roku. Po wojnie Polska znalazła się w strefie wpływów Związku Radzieckiego,
   34 |     a prawdziwie suwerenne państwo demokratyczne zaczęło się kształtować dopiero po 1989 roku.
   35 |   `;
   36 |
   37 |   test.beforeEach(async ({ page, context }) => {
   38 |     // Inicjalizacja strony generowania fiszek
   39 |     generateView = new GenerateViewPage(page);
   40 |     await generateView.goto();
   41 |
   42 |     // Zaloguj użytkownika testowego
   43 |     authUtils = new AuthUtils(page);
   44 |     await authUtils.loginTestUser();
   45 |
   46 |     // Sprawdź czy użytkownik jest zalogowany
   47 |     const isLoggedIn = await authUtils.isLoggedIn();
   48 |     if (!isLoggedIn) {
   49 |       throw new Error("Test user is not logged in. Please check authentication setup.");
   50 |     }
   51 |   });
   52 |
   53 |   test("should successfully generate flashcards from Polish text", async () => {
   54 |     // 1. Sprawdź początkowy stan
   55 |     const initialState = await generateView.getCurrentState();
   56 |     expect(initialState.flashcardsCount).toBe(0);
   57 |     expect(initialState.characterCount).toBe(0);
   58 |
   59 |     // 2. Wprowadź tekst i sprawdź licznik znaków
   60 |     await generateView.textInputSection.enterSourceText(samplePolishText);
   61 |     const stateAfterText = await generateView.getCurrentState();
   62 |     expect(stateAfterText.characterCount).toBeGreaterThanOrEqual(2000);
   63 |
   64 |     // 3. Sprawdź czy przycisk generowania jest aktywny
   65 |     expect(await generateView.isReadyForGeneration()).toBe(true);
   66 |
   67 |     // 4. Wygeneruj fiszki
   68 |     await generateView.generateFlashcardsFromText(samplePolishText);
   69 |
   70 |     // 5. Sprawdź czy fiszki zostały wygenerowane
   71 |     const stateAfterGeneration = await generateView.getCurrentState();
   72 |     expect(stateAfterGeneration.flashcardsCount).toBeGreaterThan(0);
   73 |     expect(stateAfterGeneration.validationErrors).toHaveLength(0);
   74 |
   75 |     // 6. Zaakceptuj pierwszą fiszkę
   76 |     const firstFlashcardId = "1"; // Zakładamy, że ID pierwszej fiszki to "1"
   77 |     await generateView.flashcardsList.acceptFlashcard(firstFlashcardId);
   78 |
   79 |     // 7. Sprawdź zawartość pierwszej fiszki
   80 |     const flashcardContent =
   81 |       await generateView.flashcardsList.getFlashcardContent(firstFlashcardId);
   82 |     expect(flashcardContent.front).toBeTruthy();
   83 |     expect(flashcardContent.back).toBeTruthy();
   84 |
   85 |     // 8. Sprawdź licznik zaakceptowanych fiszek
   86 |     const finalState = await generateView.getCurrentState();
   87 |     expect(finalState.acceptedCount).toBe(1);
   88 |   });
   89 |
   90 |   test("should show validation error for too short text", async () => {
   91 |     const shortText = "To jest zbyt krótki tekst.";
   92 |
   93 |     await generateView.textInputSection.enterSourceText(shortText);
   94 |
   95 |     // Próba wygenerowania fiszek z za krótkim tekstem
   96 |     const button = generateView.textInputSection.generateButton;
   97 |     expect(await button.isDisabled()).toBe(true);
   98 |
   99 |     const state = await generateView.getCurrentState();
> 100 |     expect(state.validationErrors).toContain(
      |                                    ^ Error: expect(received).toContain(expected) // indexOf
  101 |       expect.stringContaining("must be at least 1000 characters"),
  102 |     );
  103 |   });
  104 |
  105 |   test("should handle saving accepted flashcards", async () => {
  106 |     // Najpierw wygeneruj fiszki
  107 |     await generateView.generateFlashcardsFromText(samplePolishText);
  108 |
  109 |     // Zaakceptuj kilka fiszek
  110 |     await generateView.flashcardsList.acceptFlashcard("1");
  111 |     await generateView.flashcardsList.acceptFlashcard("2");
  112 |
  113 |     // Sprawdź licznik zaakceptowanych
  114 |     const stateBeforeSave = await generateView.getCurrentState();
  115 |     expect(stateBeforeSave.acceptedCount).toBe(2);
  116 |
  117 |     // Zapisz zaakceptowane fiszki
  118 |     await generateView.flashcardsList.saveAccepted();
  119 |
  120 |     // Sprawdź czy pojawił się komunikat o sukcesie
  121 |     await expect(
  122 |       generateView.page.locator('text="Accepted flashcards saved successfully!"'),
  123 |     ).toBeVisible();
  124 |   });
  125 | });
  126 |
```