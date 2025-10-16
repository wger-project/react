import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Step2Variations } from "components/Exercises/Add/Step2Variations";

import { useExercisesQuery } from "components/Exercises/queries";
import React from "react";
import { ExerciseSubmissionStateProvider } from "state";
import { testExerciseBenchPress, testExerciseCrunches, testExerciseCurls } from "tests/exerciseTestdata";

jest.mock('components/Exercises/queries');


const mockedUseExercisesQuery = useExercisesQuery as jest.Mock;


const mockOnContinue = jest.fn();
const queryClient = new QueryClient();

describe("Test the add exercise step 2 component", () => {

    beforeEach(() => {
        mockedUseExercisesQuery.mockImplementation(() => ({
            isLoading: false,
            isSuccess: true,
            data: [
                testExerciseBenchPress,
                testExerciseCurls,
                testExerciseCrunches
            ]
        }));

    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("Renders without crashing", () => {
        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <Step2Variations onContinue={mockOnContinue} />
            </QueryClientProvider>
        );

        // Assert
        expect(screen.getByText("exercises.whatVariationsExist")).toBeInTheDocument();
        expect(screen.getByText("exercises.filterVariations")).toBeInTheDocument();
        expect(screen.getByText("exercises.identicalExercisePleaseDiscard")).toBeInTheDocument();
        expect(screen.getByText("Benchpress")).toBeInTheDocument();
        expect(screen.getByText("Curls")).toBeInTheDocument();
        expect(screen.getByText("Crunches")).toBeInTheDocument();
    });

    test("Correctly sets the variation ID", async () => {
        // Act
        render(
            <ExerciseSubmissionStateProvider>
                <QueryClientProvider client={queryClient}>
                    <Step2Variations onContinue={mockOnContinue} />
                </QueryClientProvider>
            </ExerciseSubmissionStateProvider>
        );
        const benchPress = screen.getByText("Benchpress");
        await userEvent.click(benchPress);

        // Assert
        //...
    });

    test("Correctly unsets the variation ID", async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <Step2Variations onContinue={mockOnContinue} />
            </QueryClientProvider>
        );
        const benchpress = screen.getByText("Benchpress");
        await user.click(benchpress);
        await user.click(benchpress);

        // Assert
    });

    test("Correctly sets the newVariationExerciseId ID", async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <Step2Variations onContinue={mockOnContinue} />
            </QueryClientProvider>
        );
        const crunches = screen.getByText("Crunches");
        await user.click(crunches);

        // Assert
    });
    test("Correctly unsets the newVariationExerciseId ID", async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <Step2Variations onContinue={mockOnContinue} />
            </QueryClientProvider>
        );
        const crunches = screen.getByText("Crunches");
        await user.click(crunches);
        await user.click(crunches);

        // Assert
    });

    test("can correctly filter the exercises", async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <Step2Variations onContinue={mockOnContinue} />
            </QueryClientProvider>
        );
        const input = screen.getByRole('textbox', { name: /name/i });

        // Assert
        expect(screen.getByText("Benchpress")).toBeInTheDocument();
        expect(screen.getByText("Curls")).toBeInTheDocument();
        expect(screen.getByText("Crunches")).toBeInTheDocument();

        await user.type(input, 'cru');
        expect(screen.queryByText("Benchpress")).not.toBeInTheDocument();
        expect(screen.queryByText("Curls")).not.toBeInTheDocument();
        expect(screen.getByText("Crunches")).toBeInTheDocument();

        await user.clear(input);
        await user.type(input, 'Bench');
        expect(screen.getByText("Benchpress")).toBeInTheDocument();
        expect(screen.queryByText("Curls")).not.toBeInTheDocument();
        expect(screen.queryByText("Crunches")).not.toBeInTheDocument();
    });
});
