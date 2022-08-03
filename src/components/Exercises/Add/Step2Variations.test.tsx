import React from "react";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { testExerciseBenchPress, testExerciseCrunches, testExerciseCurls } from "tests/exerciseTestdata";
import { useBasesQuery } from "components/Exercises/queries";
import { Step2Variations } from "components/Exercises/Add/Step2Variations";
import userEvent from "@testing-library/user-event";
import { ExerciseStateProvider } from "state";

jest.mock('components/Exercises/queries');
jest.mock('state/exerciseReducer', () => {
    const originalModule = jest.requireActual('state/exerciseReducer');

    return {
        __esModule: true,
        ...originalModule,
        setVariationId: jest.fn(() => {
            console.log("MOCKsetVariationId!");
            return { type: 8, payload: 1 };
        }),
        setNewBaseVariationId: jest.fn(() => {
            return { type: 9, payload: 1 };
        }),

    };
});


const mockedUseBasesQuery = useBasesQuery as jest.Mock;


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
        expect(screen.getByText("Benchpress")).toBeInTheDocument();
        expect(screen.getByText("Curls")).toBeInTheDocument();
        expect(screen.getByText("Crunches")).toBeInTheDocument();
    });

    test("Correctly sets the variation ID", async () => {
        // Act
        const view = render(
            <ExerciseStateProvider>
                <QueryClientProvider client={queryClient}>
                    <Step2Variations onContinue={mockOnContinue} />
                </QueryClientProvider>
            </ExerciseStateProvider>
        );
        const benchPress = screen.getByText("Benchpress");
        await userEvent.click(benchPress);
        //const spy = jest.spyOn(Component.prototype, 'getData');
        //const spySetVariationId = jest.spyOn(allReducer, 'setVariationId');
        //const spySetNewBaseVariationId = jest.spyOn(allReducer, 'setNewBaseVariationId');

        //console.log(view);

        // Assert
        //expect(spySetVariationId).toHaveBeenCalled();
        //expect(spySetVariationId).lastCalledWith(1);
        //expect(setVariationId).lastCalledWith(1);
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
        expect(mockSetExerciseData).toHaveBeenCalledTimes(2);
    });

    test("Correctly sets the newVariationBaseId ID", async () => {
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
        expect(mockSetExerciseData).lastCalledWith(
            {
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
                <Step2Variations onContinue={mockOnContinue} />
            </QueryClientProvider>
        );
        const crunches = screen.getByText("Crunches");
        await user.click(crunches);
        await user.click(crunches);

        // Assert
        expect(mockSetExerciseData).toHaveBeenCalledTimes(2);
    });
});
