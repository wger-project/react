import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useLanguageCheckQuery } from "@/core/queries";
import { Step4Translations } from "@/components/Exercises/Add/Step4Translations";
import { useLanguageQuery } from "@/components/Exercises/queries";
import {
    setAlternativeNamesI18n,
    setDescriptionI18n,
    setLanguageId,
    setNameI18n,
    setNotesI18n,
} from "@/components/Exercises/Add/state/exerciseSubmissionReducer";
import React from "react";
import { testLanguages } from "@/tests/exerciseTestdata";
import type { Mock } from "vitest";

// It seems we run into a timeout when running the tests on github actions
vi.setConfig({ testTimeout: 30000 });

vi.mock("@/components/Exercises/queries");
vi.mock("@/core/queries");

vi.mock("@/components/Exercises/Add/state/exerciseSubmissionReducer", async () => {
    const originalModule =
        await vi.importActual<typeof import("@/components/Exercises/Add/state/exerciseSubmissionReducer")>(
            "@/components/Exercises/Add/state/exerciseSubmissionReducer"
        );
    return {
        __esModule: true,
        ...originalModule,
        setNameI18n: vi.fn(),
        setDescriptionI18n: vi.fn(),
        setAlternativeNamesI18n: vi.fn(),
        setLanguageId: vi.fn(),
        setNotesI18n: vi.fn(),
    };
});

const mockedUseLanguageQuery = useLanguageQuery as Mock;
const mockedUseLanguageCheckQuery = useLanguageCheckQuery as Mock;
const mockOnContinue = vi.fn();
const mockOnBack = vi.fn();
const queryClient = new QueryClient();
let mutateAsync: Mock;

function renderStep() {
    render(
        <QueryClientProvider client={queryClient}>
            <Step4Translations onContinue={mockOnContinue} onBack={mockOnBack} />
        </QueryClientProvider>
    );
}

describe("Test the add exercise step 4 component", () => {
    beforeEach(() => {
        mockedUseLanguageQuery.mockImplementation(() => ({
            isLoading: false,
            data: testLanguages,
        }));
        mutateAsync = vi.fn().mockResolvedValue({ success: true, data: {} });
        mockedUseLanguageCheckQuery.mockImplementation(() => ({
            isPending: false,
            mutateAsync,
        }));
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    test("Renders without crashing", () => {
        renderStep();

        // The translation switch is the entry point; the form fields stay hidden
        expect(screen.getByText("exercises.translateExerciseNow")).toBeInTheDocument();
        expect(screen.queryByText("name")).not.toBeInTheDocument();
        expect(screen.queryByText("exercises.alternativeNames")).not.toBeInTheDocument();
        expect(screen.queryByText("description")).not.toBeInTheDocument();
    });

    test("clicking 'goBack' calls onBack", async () => {
        const user = userEvent.setup();
        renderStep();

        await user.click(screen.getByText("goBack"));
        expect(mockOnBack).toHaveBeenCalled();
    });

    test("Form elements are shown after clicking on the switch", async () => {
        const user = userEvent.setup();
        renderStep();

        await user.click(screen.getByRole("switch"));

        expect(screen.getByText("name")).toBeInTheDocument();
        expect(screen.getByText("exercises.alternativeNames")).toBeInTheDocument();
    });

    test("with the toggle off: continue submits an empty translation, dispatches null language and skips the language check", async () => {
        const user = userEvent.setup();
        renderStep();

        await user.click(screen.getByText("continue"));

        await waitFor(() => {
            expect(mockOnContinue).toHaveBeenCalled();
        });
        expect(setNameI18n).toHaveBeenCalledWith("");
        expect(setDescriptionI18n).toHaveBeenCalledWith("");
        expect(setAlternativeNamesI18n).toHaveBeenCalledWith([]);
        expect(setNotesI18n).toHaveBeenCalledWith([]);
        expect(setLanguageId).toHaveBeenCalledWith(null);
        // No description is submitted, so there's no language check
        expect(mutateAsync).not.toHaveBeenCalled();
    });

    test("with translation enabled and a valid description: triggers the language check and dispatches all values", async () => {
        const VALID_DESCRIPTION =
            "Eine ausreichend lange Beschreibung der Übung, die die yup-Mindestlänge erfüllt.";
        const user = userEvent.setup();
        renderStep();

        // Enable the form
        await user.click(screen.getByRole("switch"));

        // Pick a language
        await user.click(screen.getByRole("combobox", { name: /language/i }));
        await user.click(screen.getByText(/deutsch/i));

        // Fill the name
        await user.type(screen.getByRole("textbox", { name: /name/i }), "Bankdrücken");

        // Fill the markdown description (uses the placeholder from t('useMarkdownHint'))
        const description = screen.getByPlaceholderText("useMarkdownHint");
        await user.type(description, VALID_DESCRIPTION);

        await user.click(screen.getByText("continue"));

        await waitFor(() => {
            expect(mutateAsync).toHaveBeenCalled();
        });
        // languageId from the dropdown is forwarded to the language check
        const [callArg] = (mutateAsync as Mock).mock.calls[0];
        expect(callArg.languageId).toBe(testLanguages[0].id);
        expect(callArg.input).toBe(VALID_DESCRIPTION);

        await waitFor(() => {
            expect(mockOnContinue).toHaveBeenCalled();
        });
        expect(setLanguageId).toHaveBeenCalledWith(testLanguages[0].id);
        expect(setNameI18n).toHaveBeenCalledWith("Bankdrücken");
        expect(setDescriptionI18n).toHaveBeenCalledWith(VALID_DESCRIPTION);
    });

    test("the language dropdown excludes English (the primary language is captured in step 3)", async () => {
        const user = userEvent.setup();
        renderStep();

        await user.click(screen.getByRole("switch"));
        await user.click(screen.getByRole("combobox", { name: /language/i }));

        expect(screen.queryByRole("option", { name: /english/i })).not.toBeInTheDocument();
        expect(screen.getByRole("option", { name: /deutsch/i })).toBeInTheDocument();
        expect(screen.getByRole("option", { name: /french/i })).toBeInTheDocument();
    });
});
