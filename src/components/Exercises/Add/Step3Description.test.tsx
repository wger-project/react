import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Step3Description } from "components/Exercises/Add/Step3Description";
import React from "react";
import { testQueryClient } from "tests/queryClient";

jest.mock("state/exerciseSubmissionReducer", () => {
    const originalModule = jest.requireActual("state/exerciseSubmissionReducer");
    return {
        __esModule: true,
        ...originalModule,
        setDescriptionEn: jest.fn(),
        setNotesEn: jest.fn(),
    };
});

const mockOnContinue = jest.fn();
const mockOnBack = jest.fn();

describe("Test the add exercise step 3 component", () => {

    afterEach(() => {
        jest.clearAllMocks();
    });


    function renderStep() {
        render(
            <QueryClientProvider client={testQueryClient}>
                <Step3Description
                    onBack={mockOnBack}
                    onContinue={mockOnContinue}
                />
            </QueryClientProvider>
        );
    }

    test("Renders without crashing", () => {
        // Act
        renderStep();

        // Assert
        expect(screen.getByText("continue")).toBeInTheDocument();
    });


    test("Correctly set descriptionEn", async () => {
        // Arrange
        const user = userEvent.setup();
        // const text = 'The wild boar is a suid native to much of Eurasia and North Africa';

        // Act
        renderStep();

        // TODO: fix tests, see https://github.com/wger-project/react/issues/404
        //const description = screen.getByLabelText("description");
        //await user.click(description);
        //await user.type(description, text);
        await user.click(screen.getByText('continue'));

        // Assert
        //expect(mockOnContinue).toHaveBeenCalled();
        //expect(setDescriptionEn).toHaveBeenCalledWith(text);
    });
});
