import React from "react";
import { render, screen } from "@testing-library/react";
import { Step5Images } from "components/Exercises/Add/Step5Images";


const mockOnContinue = jest.fn();
const mockOnBack = jest.fn();

describe("Test the add exercise step 5 component", () => {

    test("Smoketest", () => {
        // Act
        render(
            <Step5Images
                onContinue={mockOnContinue}
                onBack={mockOnBack}
            />
        );

        // Assert
        expect(screen.getByText('exercises.compatibleImagesCC')).toBeInTheDocument();
    });

});
