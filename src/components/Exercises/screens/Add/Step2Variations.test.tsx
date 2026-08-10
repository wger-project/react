import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Step2Variations } from "@/components/Exercises/screens/Add/Step2Variations";

import { useExercisesQuery } from "@/components/Exercises/queries";
import React from "react";
import { ExerciseSubmissionStateProvider } from "@/components/Exercises/screens/Add/state";
import { testExerciseBenchPress, testExerciseCrunches, testExerciseCurls } from "@/tests/exerciseTestdata";
import type { Mock } from 'vitest';

vi.mock('@/components/Exercises/queries');


const mockedUseExercisesQuery = useExercisesQuery as Mock;


const mockOnContinue = vi.fn();
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
        vi.clearAllMocks();
    });

    // The step only reacts to clicks when it can dispatch to the submission state,
    // outside of the provider the dispatch is a no-op.
    const renderStep = () => render(
        <ExerciseSubmissionStateProvider>
            <QueryClientProvider client={queryClient}>
                <Step2Variations onContinue={mockOnContinue} />
            </QueryClientProvider>
        </ExerciseSubmissionStateProvider>
    );

    // Benchpress and curls share a variation group and are rendered as one entry
    const switchFor = (exerciseName: string) =>
        within(screen.getByText(exerciseName).closest('li')!).getByRole('switch');

    test("Renders without crashing", () => {
        // Act
        renderStep();

        // Assert
        expect(screen.getByText("exercises.whatVariationsExist")).toBeInTheDocument();
        expect(screen.getByText("exercises.filterVariations")).toBeInTheDocument();
        expect(screen.getByText("exercises.identicalExercisePleaseDiscard")).toBeInTheDocument();
        expect(screen.getByText("Benchpress")).toBeInTheDocument();
        expect(screen.getByText("Curls")).toBeInTheDocument();
        expect(screen.getByText("Crunches")).toBeInTheDocument();
    });

    test("Correctly sets the variation ID", async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        renderStep();
        expect(switchFor("Benchpress")).not.toBeChecked();
        await user.click(screen.getByText("Benchpress"));

        // Assert
        expect(switchFor("Benchpress")).toBeChecked();
        expect(switchFor("Curls")).toBeChecked();
    });

    test("Correctly unsets the variation ID", async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        renderStep();
        await user.click(screen.getByText("Benchpress"));
        await user.click(screen.getByText("Benchpress"));

        // Assert
        expect(switchFor("Benchpress")).not.toBeChecked();
    });

    test("Correctly sets the newVariationExerciseId ID", async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        renderStep();
        expect(switchFor("Crunches")).not.toBeChecked();
        await user.click(screen.getByText("Crunches"));

        // Assert
        expect(switchFor("Crunches")).toBeChecked();
    });

    test("Correctly unsets the newVariationExerciseId ID", async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        renderStep();
        await user.click(screen.getByText("Crunches"));
        await user.click(screen.getByText("Crunches"));

        // Assert
        expect(switchFor("Crunches")).not.toBeChecked();
    });

    test("Selecting an entry deselects the previously selected one", async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        renderStep();
        await user.click(screen.getByText("Benchpress"));
        await user.click(screen.getByText("Crunches"));

        // Assert
        expect(switchFor("Crunches")).toBeChecked();
        expect(switchFor("Benchpress")).not.toBeChecked();
        expect(switchFor("Curls")).not.toBeChecked();
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
