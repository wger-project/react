import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Step1Basics } from "components/Exercises/Add/Step1Basics";
import { useCategoriesQuery, useEquipmentQuery, useMusclesQuery } from "components/Exercises/queries";
import React from "react";
import { ExerciseSubmissionStateProvider } from "state";
import {
    setAlternativeNamesEn,
    setCategory,
    setEquipment,
    setNameEn,
    setPrimaryMuscles,
    setSecondaryMuscles
} from "state/exerciseSubmissionReducer";
import { testCategories, testEquipment, testMuscles } from "tests/exerciseTestdata";

// It seems we run into a timeout when running the tests on GitHub actions
jest.setTimeout(15000);

jest.mock("components/Exercises/queries");
jest.mock("state/exerciseSubmissionReducer", () => {
    const originalModule = jest.requireActual("state/exerciseSubmissionReducer");
    return {
        __esModule: true,
        ...originalModule,
        setNameEn: jest.fn(),
        setCategory: jest.fn(),
        setAlternativeNamesEn: jest.fn(),
        setEquipment: jest.fn(),
        setPrimaryMuscles: jest.fn(),
        setSecondaryMuscles: jest.fn()
    };
});

const mockedUseCategoriesQuery = useCategoriesQuery as jest.Mock;
const mockedMuscleQuery = useMusclesQuery as jest.Mock;
const mockedUseEquipmentQuery = useEquipmentQuery as jest.Mock;


describe("<Step1Basics />", () => {

    beforeEach(() => {
        mockedUseCategoriesQuery.mockImplementation(() => (
            { isLoading: false, data: testCategories }
        ));
        mockedMuscleQuery.mockImplementation(() => (
            { isLoading: false, data: testMuscles }
        ));
        mockedUseEquipmentQuery.mockImplementation(() => (
            { isLoading: false, data: testEquipment }
        ));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("Renders without crashing", () => {
        // Arrange
        const mockOnContinue = jest.fn();

        // Act
        const queryClient = new QueryClient();
        render(
            <ExerciseSubmissionStateProvider>
                <QueryClientProvider client={queryClient}>
                    <Step1Basics onContinue={mockOnContinue} />
                </QueryClientProvider>
            </ExerciseSubmissionStateProvider>
        );

        // Assert
        expect(screen.getByText("name")).toBeInTheDocument();
        expect(screen.getByText("exercises.alternativeNames")).toBeInTheDocument();
        expect(screen.getByText("exercises.muscles")).toBeInTheDocument();
        expect(screen.getByText("exercises.secondaryMuscles")).toBeInTheDocument();
        expect(screen.getByText("exercises.equipment")).toBeInTheDocument();
    });

    test("Correctly saves the values to the provider", async () => {
        // Arrange
        const mockOnContinue = jest.fn();
        const user = userEvent.setup();

        // Act
        const queryClient = new QueryClient();
        render(
            <ExerciseSubmissionStateProvider>
                <QueryClientProvider client={queryClient}>
                    <Step1Basics onContinue={mockOnContinue} />
                </QueryClientProvider>
            </ExerciseSubmissionStateProvider>
        );

        await user.type(screen.getByLabelText("name"), 'Biceps enlarger');

        const aliases = screen.getByLabelText("exercises.alternativeNames");
        await user.type(aliases, 'Biceps enlarger 2000');
        await user.keyboard('{enter}');
        await user.type(aliases, 'Arms exploder');
        await user.keyboard('{enter}');

        await user.click(screen.getByLabelText('category'));
        await user.click(screen.getByText('Arms'));

        await user.click(screen.getByLabelText('exercises.equipment'));
        await user.click(screen.getByText('Rocks'));

        const muscles = screen.getByLabelText('exercises.muscles');
        await user.click(muscles);
        await user.click(screen.getByText(/biggus/i));
        await user.click(muscles);
        await user.click(screen.getByText(/dacttilaris/i));

        await user.click(screen.getByLabelText('exercises.secondaryMuscles'));
        await user.click(screen.getByText(/abdominis/i));

        await user.click(screen.getByText('continue'));

        // Assert
        expect(mockOnContinue).toHaveBeenCalled();
        expect(setPrimaryMuscles).toHaveBeenNthCalledWith(1, []);
        expect(setPrimaryMuscles).toHaveBeenNthCalledWith(2, [1]);
        expect(setPrimaryMuscles).toHaveBeenNthCalledWith(3, [1, 2]);
        expect(setSecondaryMuscles).toHaveBeenNthCalledWith(1, []);
        expect(setSecondaryMuscles).toHaveBeenNthCalledWith(2, [4]);
        expect(setNameEn).toHaveBeenCalledWith('Biceps enlarger');
        expect(setCategory).toHaveBeenCalledWith(1);
        expect(setAlternativeNamesEn).toHaveBeenCalledWith(['Biceps enlarger 2000', 'Arms exploder']);
        expect(setEquipment).toHaveBeenCalledWith([42]);
    });
});
