# Test info

- Name: Flashcard Generation >> should show validation error for too short text
- Location: C:\AI\10xDevs\10xCardsRepo\tests\e2e\generate-flashcards.spec.ts:120:3

# Error details

```
TimeoutError: page.waitForSelector: Timeout 10000ms exceeded.
Call log:
  - waiting for locator('[data-test-id="text-input"]') to be visible

    at C:\AI\10xDevs\10xCardsRepo\tests\e2e\generate-flashcards.spec.ts:60:20
```

# Page snapshot

```yaml
- main:
  - text: 10xCards test@test.com
  - button "Logout"
  - heading "Generate Flashcards" [level=1]
  - heading "Enter Your Text" [level=2]
  - text: 0/10000 characters
  - textbox "Paste your text here (minimum 100 characters)"
  - combobox: gpt-4o-mini
  - button "Generate Flashcards" [disabled]
- region "Notifications alt+T"
```

# Test source

```ts
   1 | import { expect } from "@playwright/test";
   2 | import { test } from "./setup/test-setup";
   3 | import { GenerateViewPage } from "./pages/GenerateView.page";
   4 |
   5 | test.describe("Flashcard Generation", () => {
   6 |   let generateView: GenerateViewPage;
   7 |
   8 |   // Increase timeout for all tests in this file
   9 |   test.setTimeout(180000); // Increased to 3 minutes
   10 |
   11 |   // Przykładowy tekst w języku polskim (ponad 2000 znaków)
   12 |   const samplePolishText = `
   13 |     Historia Polski jest niezwykle bogata i fascynująca. Państwo polskie powstało ponad tysiąc lat temu,
   14 |     a jego początki sięgają czasów Mieszka I z dynastii Piastów. To właśnie on w 966 roku przyjął chrzest,
   15 |     wprowadzając Polskę do kręgu kultury chrześcijańskiej i europejskiej. Jego syn, Bolesław Chrobry,
   16 |     został pierwszym królem Polski w 1025 roku.
   17 |
   18 |     Przez wieki Polska przechodziła różne okresy - od potęgi za czasów Jagiellonów, przez trudne momenty
   19 |     rozbiorów, aż po odrodzenie w 1918 roku. Szczególnie istotny był okres złotego wieku w XVI stuleciu,
   20 |     kiedy to Polska była jednym z największych i najsilniejszych państw w Europie. W tym czasie rozkwitała
   21 |     kultura, sztuka i nauka, a Kraków stał się jednym z najważniejszych ośrodków renesansu na północ od Alp.
   22 |
   23 |     Wiek XVII przyniósł szereg wojen i stopniowe osłabienie państwa. Mimo to Polska wciąż odgrywała istotną
   24 |     rolę w Europie, czego przykładem była odsiecz wiedeńska Jana III Sobieskiego w 1683 roku. Jednak już
   25 |     w XVIII wieku nastąpił upadek Rzeczypospolitej, zakończony rozbiorami przez Rosję, Prusy i Austrię.
   26 |
   27 |     Okres zaborów trwał 123 lata, ale Polacy nigdy nie stracili ducha walki o niepodległość. Powstania
   28 |     narodowe - kościuszkowskie, listopadowe i styczniowe - mimo że zakończone klęskami, podtrzymywały
   29 |     świadomość narodową i wolę odzyskania niepodległości. W tym czasie wielką rolę odegrała polska kultura,
   30 |     szczególnie literatura romantyczna z takimi twórcami jak Adam Mickiewicz czy Juliusz Słowacki.
   31 |
   32 |     Polska odzyskała niepodległość w 1918 roku, po zakończeniu I wojny światowej. Okres międzywojenny
   33 |     był czasem odbudowy państwowości i rozwoju gospodarczego, przerwany jednak przez wybuch II wojny
   34 |     światowej w 1939 roku. Po wojnie Polska znalazła się w strefie wpływów Związku Radzieckiego,
   35 |     a prawdziwie suwerenne państwo demokratyczne zaczęło się kształtować dopiero po 1989 roku.
   36 |
   37 |     Współczesna Polska jest członkiem Unii Europejskiej i NATO, aktywnie uczestnicząc w życiu międzynarodowym.
   38 |     Kraj przeszedł znaczącą transformację gospodarczą i społeczną, stając się jednym z najważniejszych
   39 |     państw w regionie Europy Środkowo-Wschodniej. Polska kultura, sztuka i nauka nadal się rozwijają,
   40 |     a polscy artyści, naukowcy i sportowcy odnoszą sukcesy na arenie międzynarodowej.
   41 |
   42 |     Historia Polski pokazuje, że naród polski zawsze potrafił przetrwać nawet najtrudniejsze momenty,
   43 |     zachowując swoją tożsamość i kulturę. Ta resilience i determinacja są widoczne również dzisiaj,
   44 |     gdy Polska stawia czoła nowym wyzwaniom XXI wieku.
   45 |   `;
   46 |
   47 |   test.beforeEach(async ({ page }) => {
   48 |     // Inicjalizacja strony generowania fiszek
   49 |     generateView = new GenerateViewPage(page);
   50 |
   51 |     // Add retries for page navigation with exponential backoff
   52 |     let retries = 3;
   53 |     let waitTime = 2000; // Start with 2s wait
   54 |
   55 |     while (retries > 0) {
   56 |       try {
   57 |         await generateView.goto();
   58 |         // Wait for the page to be fully loaded and interactive
   59 |         await page.waitForLoadState("networkidle");
>  60 |         await page.waitForSelector('[data-test-id="text-input"]', {
      |                    ^ TimeoutError: page.waitForSelector: Timeout 10000ms exceeded.
   61 |           state: "visible",
   62 |           timeout: 10000,
   63 |         });
   64 |         break;
   65 |       } catch (error) {
   66 |         console.log(`Navigation retry attempt ${4 - retries}, error:`, error);
   67 |         retries--;
   68 |         if (retries === 0) throw error;
   69 |         await page.waitForTimeout(waitTime);
   70 |         waitTime *= 2; // Exponential backoff
   71 |       }
   72 |     }
   73 |   });
   74 |
   75 |   test("should successfully generate flashcards from Polish text", async () => {
   76 |     // 1. Sprawdź początkowy stan
   77 |     await generateView.page.waitForLoadState("networkidle");
   78 |     const initialState = await generateView.getCurrentState();
   79 |     expect(initialState.flashcardsCount).toBe(0);
   80 |     expect(initialState.characterCount).toBe(0);
   81 |
   82 |     // 2. Wprowadź tekst i sprawdź licznik znaków
   83 |     await generateView.textInputSection.enterSourceText(samplePolishText);
   84 |     await generateView.page.waitForTimeout(1000); // Wait for character count to update
   85 |     const stateAfterText = await generateView.getCurrentState();
   86 |     expect(stateAfterText.characterCount).toBeGreaterThanOrEqual(2000);
   87 |
   88 |     // 3. Sprawdź czy przycisk generowania jest aktywny
   89 |     await generateView.page.waitForSelector('[data-test-id="generate-button"]:not([disabled])', {
   90 |       timeout: 10000,
   91 |     });
   92 |     expect(await generateView.isReadyForGeneration()).toBe(true);
   93 |
   94 |     // 4. Wygeneruj fiszki
   95 |     await generateView.generateFlashcardsFromText(samplePolishText);
   96 |
   97 |     // 5. Sprawdź czy fiszki zostały wygenerowane (z retry logic)
   98 |     let flashcardsGenerated = false;
   99 |     for (let i = 0; i < 3; i++) {
  100 |       const stateAfterGeneration = await generateView.getCurrentState();
  101 |       if (stateAfterGeneration.flashcardsCount > 0) {
  102 |         flashcardsGenerated = true;
  103 |         break;
  104 |       }
  105 |       await generateView.page.waitForTimeout(5000); // Wait 5s between checks
  106 |     }
  107 |     expect(flashcardsGenerated).toBe(true);
  108 |
  109 |     // 6. Zapisz wszystkie wygenerowane fiszki
  110 |     await generateView.flashcardsList.saveAllFlashcards();
  111 |
  112 |     // 7. Sprawdź końcowy stan z explicit wait
  113 |     await generateView.page.waitForSelector('text="All flashcards saved successfully!"', {
  114 |       timeout: 15000,
  115 |     });
  116 |     const finalState = await generateView.getCurrentState();
  117 |     expect(finalState.flashcardsCount).toBe(0);
  118 |   });
  119 |
  120 |   test("should show validation error for too short text", async () => {
  121 |     // 1. Sprawdź początkowy stan
  122 |     await generateView.page.waitForLoadState("networkidle");
  123 |     const initialState = await generateView.getCurrentState();
  124 |     expect(initialState.flashcardsCount).toBe(0);
  125 |     expect(initialState.characterCount).toBe(0);
  126 |
  127 |     // 2. Wprowadź krótki tekst
  128 |     const shortText = "To jest zbyt krótki tekst.";
  129 |     await generateView.textInputSection.enterSourceText(shortText);
  130 |
  131 |     // 3. Poczekaj na aktualizację stanu
  132 |     await generateView.page.waitForTimeout(1000); // Wait for character count to update
  133 |     const stateAfterText = await generateView.getCurrentState();
  134 |     expect(stateAfterText.characterCount).toBe(26);
  135 |
  136 |     // Wait for validation error to appear
  137 |     await generateView.page.waitForSelector('text="Text must be at least 2000 characters long"', {
  138 |       timeout: 5000,
  139 |     });
  140 |     expect(stateAfterText.validationErrors).toContain("Text must be at least 2000 characters long");
  141 |
  142 |     // 4. Sprawdź czy przycisk generowania jest wyłączony
  143 |     await generateView.page.waitForSelector('[data-test-id="generate-button"][disabled]', {
  144 |       timeout: 5000,
  145 |     });
  146 |     expect(await generateView.isReadyForGeneration()).toBe(false);
  147 |
  148 |     // 5. Sprawdź czy licznik znaków pokazuje błąd
  149 |     const characterCount = await generateView.page.locator('[data-test-id="character-count"]');
  150 |     await expect(characterCount).toHaveText("26/10000 characters");
  151 |     await expect(characterCount).toHaveClass(/text-red-600/);
  152 |
  153 |     // 6. Sprawdź czy nie można wygenerować fiszek
  154 |     try {
  155 |       await generateView.generateFlashcardsFromText(shortText);
  156 |       throw new Error("Should not be able to generate flashcards from short text");
  157 |     } catch (error: unknown) {
  158 |       if (error instanceof Error) {
  159 |         expect(error.message).toBe("Generate button is disabled");
  160 |       } else {
```