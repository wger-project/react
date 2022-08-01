import React from "react";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { testExerciseBenchPress, testExerciseCrunches, testExerciseCurls } from "tests/exerciseTestdata";
import { useBasesQuery } from "components/Exercises/queries";
import { Step2Variations } from "components/Exercises/Add/Step2Variations";
import userEvent from "@testing-library/user-event";

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
            {
                ...emptyExerciseData,
                variationId: 1,
            }
        );
    });

    test("Correctly unsets the variation ID", async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <Step2Variations
                    onContinue={mockOnContinue}
                    newExerciseData={{
                        ...emptyExerciseData,
                        variationId: 1,
                    }}
                    setNewExerciseData={mockSetExerciseData} />
            </QueryClientProvider>
        );
        const benchpress = screen.getByText("Benchpress");
        await user.click(benchpress);
        await user.click(benchpress);

        // Assert
        expect(mockSetExerciseData).toHaveBeenCalledTimes(2);
        expect(mockSetExerciseData).lastCalledWith(emptyExerciseData);
    });

    test("Correctly sets the newVariationBaseId ID", async () => {
        // Arrange
        const user = userEvent.setup();

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
        await user.click(crunches);

        // Assert
        expect(mockSetExerciseData).lastCalledWith(
            {
                ...emptyExerciseData,
                newVariationBaseId: 4,
            }
        );
    });
    test("Correctly unsets the newVariationBaseId ID", async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <Step2Variations
                    onContinue={mockOnContinue}
                    newExerciseData={{
                        ...emptyExerciseData,
                        newVariationBaseId: 4,
                    }}
                    setNewExerciseData={mockSetExerciseData} />
            </QueryClientProvider>
        );
        const crunches = screen.getByText("Crunches");
        await user.click(crunches);
        await user.click(crunches);

        // Assert
        expect(mockSetExerciseData).toHaveBeenCalledTimes(2);
        expect(mockSetExerciseData).lastCalledWith(emptyExerciseData);
    });
});
