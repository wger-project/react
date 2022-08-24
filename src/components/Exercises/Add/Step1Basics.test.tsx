import React from "react";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Step1Basics } from "components/Exercises/Add/Step1Basics";
import { testCategories, testEquipment, testMuscles } from "tests/exerciseTestdata";
import {
    useCategoriesQuery,
    useEquipmentQuery,
    useMusclesQuery
} from "components/Exercises/queries";
import { ExerciseStateProvider } from "state";
import userEvent from "@testing-library/user-event";
import { setAlternativeNamesEn, setCategory, setEquipment, setNameEn } from "state/exerciseReducer";

jest.mock("components/Exercises/queries");
jest.mock("state/exerciseReducer", () => {
    const originalModule = jest.requireActual("state/exerciseReducer");
    return {
        __esModule: true,
        ...originalModule,
        setNameEn: jest.fn(),
        setCategory: jest.fn(),
        setAlternativeNamesEn: jest.fn(),
        setEquipment: jest.fn(),

        // TODO: mocking primary and secondary muscles break the test
        // setPrimaryMuscles: jest.fn()
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
            <ExerciseStateProvider>
                <QueryClientProvider client={queryClient}>
                    <Step1Basics onContinue={mockOnContinue} />
                </QueryClientProvider>
            </ExerciseStateProvider>
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
            <ExerciseStateProvider>
                <QueryClientProvider client={queryClient}>
                    <Step1Basics onContinue={mockOnContinue} />
                </QueryClientProvider>
            </ExerciseStateProvider>
        );

        await user.type(screen.getByLabelText("name"), 'Biceps enlarger');

        const aliases = screen.getByLabelText("exercises.alternativeNames");
        await user.type(aliases, 'Biceps enlarger 2000');
        await user.keyboard('{enter}');
        await user.type(aliases, 'Arms exploder');
        await user.keyboard('{enter}');

        await user.click(screen.getByLabelText('category'));
        await user.click(screen.getByText('server.arms'));

        await user.click(screen.getByLabelText('exercises.equipment'));
        await user.click(screen.getByText('server.rocks'));

        const muscles = screen.getByLabelText('exercises.muscles');
        await user.click(muscles);
        await user.click(screen.getByText(/biggus/i));
        await user.click(muscles);
        await user.click(screen.getByText(/dacttilaris/i));

        await user.click(screen.getByLabelText('exercises.muscles'));
        await user.click(screen.getByText(/abdominis/i));


        await user.click(screen.getByText('continue'));

        // Assert
        expect(mockOnContinue).toHaveBeenCalled();
        expect(setNameEn).toHaveBeenCalledWith('Biceps enlarger');
        expect(setCategory).toHaveBeenCalledWith(1);
        expect(setAlternativeNamesEn).toHaveBeenCalledWith(['Biceps enlarger 2000', 'Arms exploder']);
        expect(setEquipment).toHaveBeenCalledWith([42]);
    });
});
