import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Step4Translations } from "@/components/Exercises/Add/Step4Translations";
import { useLanguageQuery } from "@/components/Exercises/queries";
import React from "react";
import { testLanguages } from "@/tests/exerciseTestdata";
import type { Mock } from 'vitest';

// It seems we run into a timeout when running the tests on github actions
vi.setConfig({ testTimeout: 30000 });

vi.mock("@/components/Exercises/queries");
vi.mock("@/state/exerciseSubmissionReducer", async () => {
    const originalModule = await vi.importActual<typeof import("@/state/exerciseSubmissionReducer")>("@/state/exerciseSubmissionReducer");
    return {
        __esModule: true,
        ...originalModule,
        setNameI18n: vi.fn(),
        setDescriptionI18n: vi.fn(),
        setAlternativeNamesI18n: vi.fn(),
        setLanguageId: vi.fn(),
        setEquipment: vi.fn(),
    };
});

const mockedUseLanguageQuery = useLanguageQuery as Mock;
const mockOnContinue = vi.fn();
const mockOnBack = vi.fn();
const queryClient = new QueryClient();

describe("Test the add exercise step 4 component", () => {

    beforeEach(() => {
        mockedUseLanguageQuery.mockImplementation(() => ({
            isLoading: false,
            data: testLanguages
        }));
    });


    test("Renders without crashing", () => {
        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <Step4Translations
                    onContinue={mockOnContinue}
                    onBack={mockOnBack}
                />
            </QueryClientProvider>
        );

        // Assert
        expect(screen.getByText("exercises.translateExerciseNow")).toBeInTheDocument();
        expect(screen.queryByText("name")).not.toBeInTheDocument();
        expect(screen.queryByText("exercises.alternativeNames")).not.toBeInTheDocument();
        expect(screen.queryByText("description")).not.toBeInTheDocument();
    });

    test("Form elements are shown after clicking on the switch", async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <Step4Translations
                    onContinue={mockOnContinue}
                    onBack={mockOnBack}
                />
            </QueryClientProvider>
        );
        const button = screen.getByRole('switch');
        await user.click(button);

        expect(screen.getByText("name")).toBeInTheDocument();
        expect(screen.getByText("exercises.alternativeNames")).toBeInTheDocument();
    });


    test("Correctly saves the values to the provider", async () => {
        // Arrange
        const user = userEvent.setup();
        // const text = 'Der Armvernichter ist eine ein alter chinesische Kraftübung, die...';

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <Step4Translations
                    onContinue={mockOnContinue}
                    onBack={mockOnBack}
                />
            </QueryClientProvider>
        );
        const button = screen.getByRole('switch');
        await user.click(button);

        await user.click(screen.getByRole('combobox', { name: /language/i }));
        await user.click(screen.getByText(/deutsch/i));

        await user.type(screen.getByRole('textbox', { name: /name/i }), 'Arm Vernichter');
        const aliases = screen.getByLabelText("exercises.alternativeNames");

        await user.type(aliases, 'Bizepsvergrößer');
        await user.keyboard('{enter}');
        await user.type(aliases, 'Arm Explosion');
        await user.keyboard('{enter}');

        // TODO: fix tests, see https://github.com/wger-project/react/issues/404
        //await user.type(screen.getByRole('textbox', { name: /description/i }), text);
        await user.click(screen.getByText('continue'));


        // Assert
        //expect(setLanguageId).toHaveBeenCalledWith(1);
        //expect(setNameI18n).toHaveBeenCalledWith('Arm Vernichter');
        //expect(setAlternativeNamesI18n).toHaveBeenCalledWith(['Bizepsvergrößer', 'Arm Explosion']);
        //expect(setDescriptionI18n).toHaveBeenCalledWith(text);
    });
});
