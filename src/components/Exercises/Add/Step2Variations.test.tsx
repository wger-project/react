import React from "react";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { testExerciseBenchPress, testExerciseCurls } from "tests/exerciseTestdata";
import { useBasesQuery } from "components/Exercises/queries";
import { Step2Variations } from "components/Exercises/Add/Step2Variations";

jest.mock("components/Exercises/queries");
const mockedUseBasesQuery = useBasesQuery as jest.Mock;
let emptyExerciseData = {
    category: "",
    muscles: [],
    musclesSecondary: [],
    variationId: null,
    newVariationBaseId: null,
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


describe("Test the add exercise step 2 component", () => {

    beforeEach(() => {
        mockedUseBasesQuery.mockImplementation(() => ({
            isLoading: false,
            isSuccess: true,
            data: [testExerciseBenchPress, testExerciseCurls]
        }));
        emptyExerciseData = {
            category: "",
            muscles: [],
            musclesSecondary: [],
            variationId: null,
            languageId: null,
            newVariationBaseId: null,
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

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("Renders without crashing", () => {
        // Arrange
        const mockOnContinue = jest.fn();
        const mockSetExerciseData = jest.fn();

        // Act
        const queryClient = new QueryClient();
        render(
            <QueryClientProvider client={queryClient}>
                <Step2Variations
                    onContinue={mockOnContinue}
                    newExerciseData={emptyExerciseData}
                    setNewExerciseData={mockSetExerciseData} />
            </QueryClientProvider>
        );

        // Assert
        expect(screen.getByText("exercises.whatVariationsExist")).toBeInTheDocument();
        expect(screen.getByText("Benchpress")).toBeInTheDocument();
        expect(screen.getByText("Curls")).toBeInTheDocument();
    });
});
