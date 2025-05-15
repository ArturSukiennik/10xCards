import { expect } from "@playwright/test";
import { test } from "./setup/test-setup";
import { GenerateViewPage } from "./pages/GenerateView.page";

test.describe("Flashcard Generation", () => {
  let generateView: GenerateViewPage;

  // Increase timeout for all tests in this file
  test.setTimeout(180000); // Increased to 3 minutes

  // Przykładowy tekst w języku polskim (ponad 2000 znaków)
  const samplePolishText = `
    Historia Polski jest niezwykle bogata i fascynująca. Państwo polskie powstało ponad tysiąc lat temu,
    a jego początki sięgają czasów Mieszka I z dynastii Piastów. To właśnie on w 966 roku przyjął chrzest,
    wprowadzając Polskę do kręgu kultury chrześcijańskiej i europejskiej. Jego syn, Bolesław Chrobry,
    został pierwszym królem Polski w 1025 roku.

    Przez wieki Polska przechodziła różne okresy - od potęgi za czasów Jagiellonów, przez trudne momenty
    rozbiorów, aż po odrodzenie w 1918 roku. Szczególnie istotny był okres złotego wieku w XVI stuleciu,
    kiedy to Polska była jednym z największych i najsilniejszych państw w Europie. W tym czasie rozkwitała
    kultura, sztuka i nauka, a Kraków stał się jednym z najważniejszych ośrodków renesansu na północ od Alp.

    Wiek XVII przyniósł szereg wojen i stopniowe osłabienie państwa. Mimo to Polska wciąż odgrywała istotną
    rolę w Europie, czego przykładem była odsiecz wiedeńska Jana III Sobieskiego w 1683 roku. Jednak już
    w XVIII wieku nastąpił upadek Rzeczypospolitej, zakończony rozbiorami przez Rosję, Prusy i Austrię.

    Okres zaborów trwał 123 lata, ale Polacy nigdy nie stracili ducha walki o niepodległość. Powstania
    narodowe - kościuszkowskie, listopadowe i styczniowe - mimo że zakończone klęskami, podtrzymywały
    świadomość narodową i wolę odzyskania niepodległości. W tym czasie wielką rolę odegrała polska kultura,
    szczególnie literatura romantyczna z takimi twórcami jak Adam Mickiewicz czy Juliusz Słowacki.

    Polska odzyskała niepodległość w 1918 roku, po zakończeniu I wojny światowej. Okres międzywojenny
    był czasem odbudowy państwowości i rozwoju gospodarczego, przerwany jednak przez wybuch II wojny
    światowej w 1939 roku. Po wojnie Polska znalazła się w strefie wpływów Związku Radzieckiego,
    a prawdziwie suwerenne państwo demokratyczne zaczęło się kształtować dopiero po 1989 roku.

    Współczesna Polska jest członkiem Unii Europejskiej i NATO, aktywnie uczestnicząc w życiu międzynarodowym.
    Kraj przeszedł znaczącą transformację gospodarczą i społeczną, stając się jednym z najważniejszych
    państw w regionie Europy Środkowo-Wschodniej. Polska kultura, sztuka i nauka nadal się rozwijają,
    a polscy artyści, naukowcy i sportowcy odnoszą sukcesy na arenie międzynarodowej.

    Historia Polski pokazuje, że naród polski zawsze potrafił przetrwać nawet najtrudniejsze momenty,
    zachowując swoją tożsamość i kulturę. Ta resilience i determinacja są widoczne również dzisiaj,
    gdy Polska stawia czoła nowym wyzwaniom XXI wieku.
  `;

  test.beforeEach(async ({ page }) => {
    // Inicjalizacja strony generowania fiszek
    generateView = new GenerateViewPage(page);

    // Add retries for page navigation with exponential backoff
    let retries = 3;
    let waitTime = 2000; // Start with 2s wait

    while (retries > 0) {
      try {
        await generateView.goto();
        // Wait for the page to be fully loaded and interactive
        await page.waitForLoadState("networkidle");
        const inputElement = await page.waitForSelector('[data-test-id="source-text-input"]', {
          state: "visible",
          timeout: 30000, // Increased timeout
        });

        // Check if the element is actually visible in viewport
        const isVisible = await inputElement.isVisible();
        if (!isVisible) {
          throw new Error("Input element is not visible in viewport");
        }
        break;
      } catch (error) {
        console.log(`Navigation retry attempt ${4 - retries}, error:`, error);
        retries--;
        if (retries === 0) throw error;
        await page.waitForTimeout(waitTime);
        waitTime *= 2; // Exponential backoff
      }
    }
  });

  test("should successfully generate flashcards from Polish text", async () => {
    // 1. Sprawdź początkowy stan
    await generateView.page.waitForLoadState("networkidle");
    const initialState = await generateView.getCurrentState();
    expect(initialState.flashcardsCount).toBe(0);
    expect(initialState.characterCount).toBe(0);

    // 2. Wprowadź tekst i sprawdź licznik znaków
    await generateView.textInputSection.enterSourceText(samplePolishText);
    await generateView.page.waitForTimeout(1000); // Wait for character count to update
    const stateAfterText = await generateView.getCurrentState();
    expect(stateAfterText.characterCount).toBeGreaterThanOrEqual(2000);

    // 3. Sprawdź czy przycisk generowania jest aktywny
    await generateView.page.waitForSelector('[data-test-id="generate-button"]:not([disabled])', {
      timeout: 30000, // Increased timeout
    });
    expect(await generateView.isReadyForGeneration()).toBe(true);

    // 4. Wygeneruj fiszki
    await generateView.generateFlashcardsFromText(samplePolishText);

    // 5. Sprawdź czy fiszki zostały wygenerowane (z retry logic)
    let flashcardsGenerated = false;
    for (let i = 0; i < 3; i++) {
      const stateAfterGeneration = await generateView.getCurrentState();
      if (stateAfterGeneration.flashcardsCount > 0) {
        flashcardsGenerated = true;
        break;
      }
      await generateView.page.waitForTimeout(10000); // Increased wait time between checks
    }
    expect(flashcardsGenerated).toBe(true);

    // 6. Zapisz wszystkie wygenerowane fiszki
    await generateView.flashcardsList.saveAllFlashcards();

    // 7. Sprawdź końcowy stan z explicit wait i upewnij się, że komunikat jest widoczny
    const successMessage = await generateView.page.waitForSelector(
      'text="All flashcards saved successfully!"',
      {
        state: "visible",
        timeout: 30000, // Increased timeout
      }
    );

    // Sprawdź czy komunikat jest faktycznie widoczny w viewport
    const isSuccessMessageVisible = await successMessage.isVisible();
    expect(isSuccessMessageVisible).toBe(true);

    const finalState = await generateView.getCurrentState();
    expect(finalState.flashcardsCount).toBe(0);
  });

  test("should show validation error for too short text", async () => {
    // 1. Sprawdź początkowy stan
    await generateView.page.waitForLoadState("networkidle");
    const initialState = await generateView.getCurrentState();
    expect(initialState.flashcardsCount).toBe(0);
    expect(initialState.characterCount).toBe(0);

    // 2. Wprowadź krótki tekst
    const shortText = "To jest zbyt krótki tekst.";
    await generateView.textInputSection.enterSourceText(shortText);

    // 3. Poczekaj na aktualizację stanu
    await generateView.page.waitForTimeout(1000); // Wait for character count to update
    const stateAfterText = await generateView.getCurrentState();
    expect(stateAfterText.characterCount).toBe(26);

    // Wait for validation error to appear and be visible
    const errorMessage = await generateView.page.waitForSelector(
      'text="Text must be at least 2000 characters long"',
      {
        state: "visible",
        timeout: 30000, // Increased timeout
      }
    );

    // Sprawdź czy komunikat błędu jest faktycznie widoczny w viewport
    const isErrorMessageVisible = await errorMessage.isVisible();
    expect(isErrorMessageVisible).toBe(true);

    expect(stateAfterText.validationErrors).toContain("Text must be at least 2000 characters long");

    // 4. Sprawdź czy przycisk generowania jest wyłączony
    await generateView.page.waitForSelector('[data-test-id="generate-button"][disabled]', {
      timeout: 30000, // Increased timeout
    });
    expect(await generateView.isReadyForGeneration()).toBe(false);

    // 5. Sprawdź czy licznik znaków pokazuje błąd
    const characterCount = await generateView.page.locator('[data-test-id="character-count"]');
    await expect(characterCount).toHaveText("26/10000 characters");
    await expect(characterCount).toHaveClass(/text-red-600/);

    // 6. Sprawdź czy nie można wygenerować fiszek
    try {
      await generateView.generateFlashcardsFromText(shortText);
      throw new Error("Should not be able to generate flashcards from short text");
    } catch (error: unknown) {
      if (error instanceof Error) {
        expect(error.message).toBe("Generate button is disabled");
      } else {
        throw error;
      }
    }

    // 7. Sprawdź końcowy stan - nie powinno być żadnych fiszek
    await generateView.page.waitForTimeout(1000); // Give time for any potential state changes
    const finalState = await generateView.getCurrentState();
    expect(finalState.flashcardsCount).toBe(0);
  });

  test("should handle saving all generated flashcards", async () => {
    // 1. Wygeneruj fiszki
    await generateView.page.waitForLoadState("networkidle");
    await generateView.generateFlashcardsFromText(samplePolishText);

    // 2. Sprawdź stan przed zapisaniem (z retry logic)
    let flashcardsGenerated = false;
    for (let i = 0; i < 3; i++) {
      const stateBeforeSave = await generateView.getCurrentState();
      if (stateBeforeSave.flashcardsCount > 0) {
        flashcardsGenerated = true;
        break;
      }
      await generateView.page.waitForTimeout(10000); // Increased wait time between checks
    }
    expect(flashcardsGenerated).toBe(true);

    // 3. Zapisz wszystkie wygenerowane fiszki
    await generateView.flashcardsList.saveAllFlashcards();

    // 4. Sprawdź czy lista została wyczyszczona i pojawił się komunikat o sukcesie
    const successMessage = await generateView.page.waitForSelector(
      'text="All flashcards saved successfully!"',
      {
        state: "visible",
        timeout: 30000, // Increased timeout
      }
    );

    // Sprawdź czy komunikat jest faktycznie widoczny w viewport
    const isSuccessMessageVisible = await successMessage.isVisible();
    expect(isSuccessMessageVisible).toBe(true);

    const stateAfterSave = await generateView.getCurrentState();
    expect(stateAfterSave.flashcardsCount).toBe(0);
  });
});
