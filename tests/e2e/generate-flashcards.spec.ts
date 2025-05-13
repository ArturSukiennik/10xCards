import { expect } from "@playwright/test";
import { test } from "./setup/test-setup";
import { GenerateViewPage } from "./pages/GenerateView.page";
import { AuthUtils } from "./utils/auth";

test.describe("Flashcard Generation", () => {
  let generateView: GenerateViewPage;
  let authUtils: AuthUtils;

  // Przykładowy tekst w języku polskim (około 2000 znaków)
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
  `;

  test.beforeEach(async ({ page, context }) => {
    // Inicjalizacja strony generowania fiszek
    generateView = new GenerateViewPage(page);
    await generateView.goto();

    // Zaloguj użytkownika testowego
    authUtils = new AuthUtils(page);
    await authUtils.loginTestUser();

    // Sprawdź czy użytkownik jest zalogowany
    const isLoggedIn = await authUtils.isLoggedIn();
    if (!isLoggedIn) {
      throw new Error("Test user is not logged in. Please check authentication setup.");
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
    expect(stateAfterGeneration.validationErrors).toHaveLength(0);

    // 6. Zaakceptuj pierwszą fiszkę
    const firstFlashcardId = "1"; // Zakładamy, że ID pierwszej fiszki to "1"
    await generateView.flashcardsList.acceptFlashcard(firstFlashcardId);

    // 7. Sprawdź zawartość pierwszej fiszki
    const flashcardContent =
      await generateView.flashcardsList.getFlashcardContent(firstFlashcardId);
    expect(flashcardContent.front).toBeTruthy();
    expect(flashcardContent.back).toBeTruthy();

    // 8. Sprawdź licznik zaakceptowanych fiszek
    const finalState = await generateView.getCurrentState();
    expect(finalState.acceptedCount).toBe(1);
  });

  test("should show validation error for too short text", async () => {
    const shortText = "To jest zbyt krótki tekst.";

    await generateView.textInputSection.enterSourceText(shortText);

    // Próba wygenerowania fiszek z za krótkim tekstem
    const button = generateView.textInputSection.generateButton;
    expect(await button.isDisabled()).toBe(true);

    const state = await generateView.getCurrentState();
    expect(state.validationErrors).toContain(
      expect.stringContaining("must be at least 1000 characters"),
    );
  });

  test("should handle saving accepted flashcards", async () => {
    // Najpierw wygeneruj fiszki
    await generateView.generateFlashcardsFromText(samplePolishText);

    // Zaakceptuj kilka fiszek
    await generateView.flashcardsList.acceptFlashcard("1");
    await generateView.flashcardsList.acceptFlashcard("2");

    // Sprawdź licznik zaakceptowanych
    const stateBeforeSave = await generateView.getCurrentState();
    expect(stateBeforeSave.acceptedCount).toBe(2);

    // Zapisz zaakceptowane fiszki
    await generateView.flashcardsList.saveAccepted();

    // Sprawdź czy pojawił się komunikat o sukcesie
    await expect(
      generateView.page.locator('text="Accepted flashcards saved successfully!"'),
    ).toBeVisible();
  });
});
