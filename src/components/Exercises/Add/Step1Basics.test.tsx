import React from "react";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { Step1Basics } from "components/Exercises/Add/Step1Basics";
import { testCategories, testEquipment, testMuscles } from "tests/exerciseTestdata";
import { useCategoriesQuery, useEquipmentQuery, useMusclesQuery } from "components/Exercises/queries";

jest.mock("components/Exercises/queries");
const mockedUseCategoriesQuery = useCategoriesQuery as jest.Mock;
const mockedMuscleQuery = useMusclesQuery as jest.Mock;
const mockedUseEquipmentQuery = useEquipmentQuery as jest.Mock;
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


describe("Test the add exercise step 1 component", () => {

    beforeEach(() => {
        mockedUseCategoriesQuery.mockImplementation(() => ({ isLoading: false, data: testCategories }));
        mockedMuscleQuery.mockImplementation(() => ({ isLoading: false, data: testMuscles }));
        mockedUseEquipmentQuery.mockImplementation(() => ({ isLoading: false, data: testEquipment }));
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
                <Step1Basics
                    onContinue={mockOnContinue}
                    newExerciseData={emptyExerciseData}
                    setNewExerciseData={mockSetExerciseData} />
            </QueryClientProvider>
        );

        // Assert
        expect(screen.getByText("name")).toBeInTheDocument();
        expect(screen.getByText("exercises.alternativeNames")).toBeInTheDocument();
        expect(screen.getByText("category")).toBeInTheDocument();
        expect(screen.getByText("exercises.muscles")).toBeInTheDocument();
        expect(screen.getByText("exercises.secondaryMuscles")).toBeInTheDocument();
        expect(screen.getByText("exercises.equipment")).toBeInTheDocument();
    });
});
