import React from "react";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { testExerciseBenchPress, testExerciseCrunches, testExerciseCurls } from "tests/exerciseTestdata";
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

const mockOnContinue = jest.fn();
const mockSetExerciseData = jest.fn();
const queryClient = new QueryClient();

describe("Test the add exercise step 2 component", () => {

    beforeEach(() => {
        mockedUseBasesQuery.mockImplementation(() => ({
            isLoading: false,
            isSuccess: true,
            data: [
                testExerciseBenchPress,
                testExerciseCurls,
                testExerciseCrunches
            ]
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
        // Act
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
        expect(screen.getByText("Crunches")).toBeInTheDocument();
    });

    test("Correctly sets the variation ID", () => {
        // Arrange
        const expectExerciseData = {
            ...emptyExerciseData,
            variationId: 1,
        };

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <Step2Variations
                    onContinue={mockOnContinue}
                    newExerciseData={emptyExerciseData}
                    setNewExerciseData={mockSetExerciseData} />
            </QueryClientProvider>
        );
        const benchpress = screen.getByText("Benchpress");
        benchpress.click();

        // Assert
        // Bench press and curls are in the same variation group, clicking on them
        // should set the variationId to 1 and leave the newVariationBaseId as null
        expect(mockSetExerciseData).lastCalledWith(
            expect.objectContaining(expectExerciseData)
        );
    });

    test("Correctly sets the newVariationBaseId ID", () => {
        // Arrange
        const expectExerciseData = {
            ...emptyExerciseData,
            newVariationBaseId: 4,
        };

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <Step2Variations
                    onContinue={mockOnContinue}
                    newExerciseData={emptyExerciseData}
                    setNewExerciseData={mockSetExerciseData} />
            </QueryClientProvider>
        );
        const crunches = screen.getByText("Crunches");
        crunches.click();

        // Assert
        // Crunches has no variation, clicking on it should set the newVariationBaseId
        // to 4 and leave the variationId as null
        expect(mockSetExerciseData).lastCalledWith(
            expect.objectContaining(expectExerciseData)
        );
    });
});
