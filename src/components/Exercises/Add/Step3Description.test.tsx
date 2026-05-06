import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useLanguageCheckQuery } from "@/components/Core/queries";
import { Step3Description } from "@/components/Exercises/Add/Step3Description";
import {
    setDescriptionEn,
    setNotesEn,
} from "@/state/exerciseSubmissionReducer";
import React from "react";
import { testQueryClient } from "@/tests/queryClient";
import type { Mock } from "vitest";

vi.mock("@/components/Core/queries");

vi.mock("@/state/exerciseSubmissionReducer", async () => {
    const originalModule =
        await vi.importActual<typeof import("@/state/exerciseSubmissionReducer")>(
            "@/state/exerciseSubmissionReducer"
        );
    return {
        __esModule: true,
        ...originalModule,
        setDescriptionEn: vi.fn(),
        setNotesEn: vi.fn(),
    };
});

const mockedUseLanguageCheckQuery = useLanguageCheckQuery as Mock;
const mockOnContinue = vi.fn();
const mockOnBack = vi.fn();
let mutateAsync: Mock;

function renderStep() {
    render(
        <QueryClientProvider client={testQueryClient}>
            <Step3Description onBack={mockOnBack} onContinue={mockOnContinue} />
        </QueryClientProvider>
    );
}

describe("Test the add exercise step 3 component", () => {
    beforeEach(() => {
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

        expect(screen.getByText("continue")).toBeInTheDocument();
        expect(screen.getByText("goBack")).toBeInTheDocument();
    });

    test("clicking 'goBack' calls onBack", async () => {
        const user = userEvent.setup();
        renderStep();

        await user.click(screen.getByText("goBack"));

        expect(mockOnBack).toHaveBeenCalled();
    });

    test("the continue button is disabled while the language check is pending", () => {
        mockedUseLanguageCheckQuery.mockImplementation(() => ({
            isPending: true,
            mutateAsync,
        }));
        renderStep();

        const continueBtn = screen.getByRole("button", { name: /continue/i });
        expect(continueBtn).toBeDisabled();
    });

    // The yup validator requires at least 40 characters, so any happy-path test
    // has to fill the markdown editor before submitting.
    const VALID_DESCRIPTION =
        "This is a long enough description for the exercise that satisfies the minimum length validator.";

    async function fillDescription(user: ReturnType<typeof userEvent.setup>, value: string) {
        // The MarkdownEditor TextField uses t('useMarkdownHint') as placeholder;
        // in the test setup translations resolve to the key.
        const textarea = screen.getByPlaceholderText("useMarkdownHint");
        await user.clear(textarea);
        await user.type(textarea, value);
    }

    test("on success: dispatches description/notes and calls onContinue", async () => {
        const user = userEvent.setup();
        renderStep();

        await fillDescription(user, VALID_DESCRIPTION);
        await user.click(screen.getByText("continue"));

        // language check was triggered with the typed value
        await waitFor(() => {
            expect(mutateAsync).toHaveBeenCalled();
        });
        const [callArg] = (mutateAsync as Mock).mock.calls[0];
        expect(callArg.input).toBe(VALID_DESCRIPTION);

        // both pieces of state are persisted
        expect(setDescriptionEn).toHaveBeenCalledWith(VALID_DESCRIPTION);
        expect(setNotesEn).toHaveBeenCalled();
        // continue was called
        await waitFor(() => {
            expect(mockOnContinue).toHaveBeenCalled();
        });
    });

    test("on language-check failure: still dispatches but does not call onContinue", async () => {
        // The mutation itself doesn't reject - it returns the error payload directly.
        // The component branches on whether 'success' is in the result.
        mutateAsync = vi.fn().mockResolvedValue({
            check: { message: "this does not look like English" },
        });
        mockedUseLanguageCheckQuery.mockImplementation(() => ({
            isPending: false,
            mutateAsync,
        }));

        const user = userEvent.setup();
        renderStep();

        await fillDescription(user, VALID_DESCRIPTION);
        await user.click(screen.getByText("continue"));

        await waitFor(() => {
            expect(mutateAsync).toHaveBeenCalled();
        });
        // State is still saved before the early return
        expect(setDescriptionEn).toHaveBeenCalledWith(VALID_DESCRIPTION);
        expect(setNotesEn).toHaveBeenCalled();
        // But the user does NOT advance to the next step
        expect(mockOnContinue).not.toHaveBeenCalled();
    });
});
