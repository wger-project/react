import React from "react";
import { render, screen } from "@testing-library/react";
import { Step3Description } from "components/Exercises/Add/Step3Description";
import userEvent from "@testing-library/user-event";


const mockOnContinue = jest.fn();
const mockOnBack = jest.fn();
const mockSetExerciseData = jest.fn();

describe("Test the add exercise step 3 component", () => {

    afterEach(() => {
        jest.clearAllMocks();
    });


    test("Renders without crashing", () => {
        // Act
        render(
            <Step3Description
                onBack={mockOnBack}
                onContinue={mockOnContinue}
            />
        );

        // Assert
        expect(screen.getByText("description")).toBeInTheDocument();
        expect(screen.getByText("continue")).toBeInTheDocument();
    });


    test("Correctly set descriptionEn", async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        render(
            <Step3Description
                onBack={mockOnBack}
                onContinue={mockOnContinue}
            />
        );
        const description = screen.getByLabelText("description");
        await user.click(description);
        await user.type(description, 'The wild boar is a suid native to much of Eurasia and North Africa');
        await user.click(screen.getByText('continue'));

        // Assert
        expect(mockOnContinue).toHaveBeenCalled();
        expect(mockSetExerciseData).lastCalledWith({
            descriptionEn: 'The wild boar is a suid native to much of Eurasia and North Africa',
        });
    });
});
