import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { Step4Translations } from "components/Exercises/Add/Step4Translations";
import { useLanguageQuery } from "components/Exercises/queries";
import { testLanguages } from "tests/exerciseTestdata";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

jest.mock("components/Exercises/queries");
const mockedUseLanguageQuery = useLanguageQuery as jest.Mock;
const mockOnContinue = jest.fn();
const mockOnBack = jest.fn();
const mockSetExerciseData = jest.fn();
const queryClient = new QueryClient();

describe("Test the add exercise step 4 component", () => {

    beforeEach(() => {

        mockedUseLanguageQuery.mockImplementation(() => ({ isLoading: false, data: testLanguages }));

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

    test("Form elements are shown after clicking on the switch", () => {
        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <Step4Translations
                    onContinue={mockOnContinue}
                    onBack={mockOnBack}
                />
            </QueryClientProvider>
        );
        const button = screen.getByRole('checkbox');

        // Assert
        expect(button).toBeInTheDocument();
        fireEvent.click(button);

        expect(screen.getByText("name")).toBeInTheDocument();
        expect(screen.getByText("exercises.alternativeNames")).toBeInTheDocument();
        expect(screen.getByText("description")).toBeInTheDocument();
    });
});
