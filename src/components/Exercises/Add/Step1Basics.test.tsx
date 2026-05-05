import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Step1Basics } from "@/components/Exercises/Add/Step1Basics";
import { useCategoriesQuery, useEquipmentQuery, useMusclesQuery } from "@/components/Exercises/queries";
import React from "react";
import { ExerciseSubmissionStateProvider } from "@/state";
import {
    setAlternativeNamesEn,
    setCategory,
    setEquipment,
    setNameEn,
    setPrimaryMuscles,
    setSecondaryMuscles
} from "@/state/exerciseSubmissionReducer";
import type { Mock } from 'vitest';
import { testCategories, testEquipment, testMuscles } from "@/tests/exerciseTestdata";

// It seems we run into a timeout when running the tests on GitHub actions
vi.setConfig({ testTimeout: 15000 });

vi.mock("@/components/Exercises/queries");
vi.mock("@/state/exerciseSubmissionReducer", async () => {
    const originalModule = await vi.importActual<typeof import("@/state/exerciseSubmissionReducer")>("@/state/exerciseSubmissionReducer");
    return {
        __esModule: true,
        ...originalModule,
        setNameEn: vi.fn(),
        setCategory: vi.fn(),
        setAlternativeNamesEn: vi.fn(),
        setEquipment: vi.fn(),
        setPrimaryMuscles: vi.fn(),
        setSecondaryMuscles: vi.fn()
    };
});

const mockedUseCategoriesQuery = useCategoriesQuery as Mock;
const mockedMuscleQuery = useMusclesQuery as Mock;
const mockedUseEquipmentQuery = useEquipmentQuery as Mock;


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
        vi.clearAllMocks();
    });

    test("Renders without crashing", () => {
        // Arrange
        const mockOnContinue = vi.fn();

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
        const mockOnContinue = vi.fn();
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
        expect(setAlternativeNamesEn).toHaveBeenCalledWith([
            { 'alias': 'Biceps enlarger 2000' },
            { 'alias': 'Arms exploder' }
        ]);
        expect(setEquipment).toHaveBeenCalledWith([42]);
    });
});
