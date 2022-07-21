import React from "react";
import { render, screen } from "@testing-library/react";
import { Step3Description } from "components/Exercises/Add/Step3Description";

let emptyExerciseData = {
    category: "",
    muscles: [],
    musclesSecondary: [],
    variationId: null,
    languageId: null,
    equipment: [],

    nameEn: "",
    descriptionEn: "",
    alternativeNamesEn: [],

    nameTranslation: "",
    alternativeNamesTranslation: [],
    descriptionTranslation: "",
    images: [],
};

describe("Test the add exercise step 3 component", () => {

    beforeEach(() => {
        emptyExerciseData = {
            category: "",
            muscles: [],
            musclesSecondary: [],
            variationId: null,
            languageId: null,
            equipment: [],

            nameEn: "",
            descriptionEn: "",
            alternativeNamesEn: [],

            nameTranslation: "",
            alternativeNamesTranslation: [],
            descriptionTranslation: "",
            images: [],
        };
    });


    test("Renders without crashing", () => {
        // Arrange
        const mockOnContinue = jest.fn();
        const mockOnBack = jest.fn();
        const mockSetExerciseData = jest.fn();

        // Act
        render(
            <Step3Description
                onBack={mockOnBack}
                onContinue={mockOnContinue}
                newExerciseData={emptyExerciseData}
                setNewExerciseData={mockSetExerciseData} />
        );

        // Assert
        expect(screen.getByText("description")).toBeInTheDocument();
    });
});
