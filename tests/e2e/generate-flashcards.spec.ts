import { expect } from "@playwright/test";
import { test } from "./setup/test-setup";
import { GenerateViewPage } from "./pages/GenerateView.page";

test.describe("Flashcard Generation", () => {
  let generateView: GenerateViewPage;

  // Increase timeout for all tests in this file
  test.setTimeout(120000);

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

    // Add retries for page navigation
    let retries = 3;
    while (retries > 0) {
      try {
        await generateView.goto();
        break;
      } catch (error) {
        console.log(`Navigation retry attempt ${4 - retries}, error:`, error);
        retries--;
        if (retries === 0) throw error;
        await page.waitForTimeout(2000); // Wait 2s between retries
      }
    }
  });

  test("should successfully generate flashcards from Polish text", async () => {
    // 1. Sprawdź początkowy stan
    const initialState = await generateView.getCurrentState();
    expect(initialState.flashcardsCount).toBe(0);
    expect(initialState.characterCount).toBe(0);

    // 2. Wprowadź tekst i sprawdź licznik znaków
    await generateView.textInputSection.enterSourceText(samplePolishText);
    const stateAfterText = await generateView.getCurrentState();
    expect(stateAfterText.characterCount).toBeGreaterThanOrEqual(2000);

    // 3. Sprawdź czy przycisk generowania jest aktywny
    expect(await generateView.isReadyForGeneration()).toBe(true);

    // 4. Wygeneruj fiszki
    await generateView.generateFlashcardsFromText(samplePolishText);

    // 5. Sprawdź czy fiszki zostały wygenerowane
    const stateAfterGeneration = await generateView.getCurrentState();
    expect(stateAfterGeneration.flashcardsCount).toBeGreaterThan(0);

    // 6. Zapisz wszystkie wygenerowane fiszki
    await generateView.flashcardsList.saveAllFlashcards();

    // 7. Sprawdź końcowy stan - lista powinna być wyczyszczona po zapisie
    const finalState = await generateView.getCurrentState();
    expect(finalState.flashcardsCount).toBe(0);
    // Sprawdź czy pojawił się komunikat o sukcesie
    await expect(
      generateView.page.locator('text="All flashcards saved successfully!"'),
    ).toBeVisible();
  });

  test("should show validation error for too short text", async () => {
    const shortText = "To jest zbyt krótki tekst.";

    await generateView.textInputSection.enterSourceText(shortText);

    // Sprawdź czy przycisk generowania jest wyłączony
    const button = generateView.textInputSection.generateButton;
    expect(await button.isDisabled()).toBe(true);

    // Sprawdź czy licznik znaków pokazuje błąd
    const characterCount = await generateView.page.locator('[data-test-id="character-count"]');
    const characterCountText = await characterCount.textContent();
    expect(characterCountText).toContain("26/10000 characters");
    expect(await characterCount.evaluate((el) => el.classList.contains("text-red-600"))).toBe(true);
  });

  test("should handle saving all generated flashcards", async () => {
    // 1. Wygeneruj fiszki
    await generateView.generateFlashcardsFromText(samplePolishText);

    // 2. Sprawdź stan przed zapisaniem
    const stateBeforeSave = await generateView.getCurrentState();
    expect(stateBeforeSave.flashcardsCount).toBeGreaterThan(0);

    // 3. Zapisz wszystkie wygenerowane fiszki
    await generateView.flashcardsList.saveAllFlashcards();

    // 4. Sprawdź czy lista została wyczyszczona i pojawił się komunikat o sukcesie
    const stateAfterSave = await generateView.getCurrentState();
    expect(stateAfterSave.flashcardsCount).toBe(0);
    await expect(
      generateView.page.locator('text="All flashcards saved successfully!"'),
    ).toBeVisible();
  });
});
