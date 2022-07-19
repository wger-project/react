import React from 'react';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { getCategories, getEquipment, getExerciseBases, getLanguages, getMuscles } from "services";
import { ExerciseOverview } from "components/Exercises/ExerciseOverview";
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from "react-query";
import {
    testCategories,
    testEquipment,
    testExerciseBenchPress,
    testExerciseCrunches,
    testExerciseCurls,
    testExerciseSkullCrusher,
    testExerciseSquats,
    testLanguages,
    testMuscles
} from "tests/exerciseTestdata";

jest.mock("services");

describe("Test the ExerciseOverview component", () => {


    beforeEach(() => {
        // @ts-ignore
        getLanguages.mockImplementation(() => Promise.resolve(testLanguages));
        // @ts-ignore
        getCategories.mockImplementation(() => Promise.resolve(testCategories));
        // @ts-ignore
        getMuscles.mockImplementation(() => Promise.resolve(testMuscles));
        // @ts-ignore
        getEquipment.mockImplementation(() => Promise.resolve(testEquipment));
        // @ts-ignore
        getExerciseBases.mockImplementation(() => Promise.resolve([
            testExerciseSquats,
            testExerciseBenchPress,
            testExerciseCurls,
            testExerciseCrunches,
            testExerciseSkullCrusher
        ]));
    });


    test('renders all exercises', async () => {


        // Act
        // since  OverviewCard inside ExerciseOverview renders a Link, we need to wrap in a BrowserRouter
        const queryClient = new QueryClient();
        render(
            <BrowserRouter>
                <QueryClientProvider client={queryClient}>
                    <ExerciseOverview />
                </QueryClientProvider>
            </BrowserRouter>
        );
        await act(() => Promise.resolve());

        // Assert
        expect(getCategories).toHaveBeenCalledTimes(1);
        expect(getMuscles).toHaveBeenCalledTimes(1);
        expect(getEquipment).toHaveBeenCalledTimes(1);
        expect(getExerciseBases).toHaveBeenCalledTimes(1);

        expect(screen.getByText('Benchpress')).toBeInTheDocument();
        expect(screen.getByText('Squats')).toBeInTheDocument();
        expect(screen.getByText('Curls')).toBeInTheDocument();
        expect(screen.getByText('Crunches')).toBeInTheDocument();
        expect(screen.getByText('Skull crusher')).toBeInTheDocument();
    });

    test('filter one category', async () => {

        // Act
        // since  OverviewCard inside ExerciseOverview renders a Link, we need to wrap in a BrowserRouter
        const queryClient = new QueryClient();
        render(
            <BrowserRouter>
                <QueryClientProvider client={queryClient}>
                    <ExerciseOverview />
                </QueryClientProvider>
            </BrowserRouter>
        );
        await act(() => Promise.resolve());
        const { getByText: categoriesComponent } = within(screen.getByTestId('categories'));
        fireEvent.click(categoriesComponent("exercises.arms"));

        // Assert
        expect(screen.queryByText('Benchpress')).not.toBeInTheDocument();
        expect(screen.queryByText('Squats')).not.toBeInTheDocument();
        expect(screen.getByText('Curls')).toBeInTheDocument();
        expect(screen.queryByText('Crunches')).not.toBeInTheDocument();
        expect(screen.getByText('Skull crusher')).toBeInTheDocument();
    });

    test('filter two categories', async () => {

        // Act
        // since  OverviewCard inside ExerciseOverview renders a Link, we need to wrap in a BrowserRouter
        const queryClient = new QueryClient();
        render(
            <BrowserRouter>
                <QueryClientProvider client={queryClient}>
                    <ExerciseOverview />
                </QueryClientProvider>
            </BrowserRouter>
        );
        await act(() => Promise.resolve());
        const { getByText: categoriesComponent } = within(screen.getByTestId('categories'));
        fireEvent.click(categoriesComponent("exercises.arms"));
        fireEvent.click(categoriesComponent("exercises.legs"));

        // Assert
        expect(screen.getByText('Squats')).toBeInTheDocument();
        expect(screen.getByText('Benchpress')).toBeInTheDocument();
        expect(screen.getByText('Curls')).toBeInTheDocument();
        expect(screen.queryByText('Crunches')).not.toBeInTheDocument();
        expect(screen.getByText('Skull crusher')).toBeInTheDocument();
    });

    test('filter equipment', async () => {

        // Act
        // since  OverviewCard inside ExerciseOverview renders a Link, we need to wrap in a BrowserRouter
        const queryClient = new QueryClient();
        render(
            <BrowserRouter>
                <QueryClientProvider client={queryClient}>
                    <ExerciseOverview />
                </QueryClientProvider>
            </BrowserRouter>
        );
        await act(() => Promise.resolve());
        const { getByText: equipmentComponent } = within(screen.getByTestId('equipment'));
        fireEvent.click(equipmentComponent("exercises.barbell"));

        // Assert
        expect(screen.getByText('Squats')).toBeInTheDocument();
        expect(screen.getByText('Benchpress')).toBeInTheDocument();
        expect(screen.queryByText('Curls')).not.toBeInTheDocument();
        expect(screen.queryByText('Crunches')).not.toBeInTheDocument();
        expect(screen.getByText('Skull crusher')).toBeInTheDocument();
    });

    test('filter muscles', async () => {

        // Act
        // since  OverviewCard inside ExerciseOverview renders a Link, we need to wrap in a BrowserRouter
        const queryClient = new QueryClient();
        render(
            <BrowserRouter>
                <QueryClientProvider client={queryClient}>
                    <ExerciseOverview />
                </QueryClientProvider>
            </BrowserRouter>
        );
        await act(() => Promise.resolve());
        const { getByText: musclesComponent } = within(screen.getByTestId('muscles'));
        fireEvent.click(musclesComponent("Biggus musculus"));

        // Assert
        expect(screen.getByText('Squats')).toBeInTheDocument();
        expect(screen.queryByText('Benchpress')).not.toBeInTheDocument();
        expect(screen.getByText('Curls')).toBeInTheDocument();
        expect(screen.queryByText('Crunches')).not.toBeInTheDocument();
        expect(screen.queryByText('Skull crusher')).not.toBeInTheDocument();
    });

    test('filter equipment and category', async () => {

        // Act
        // since  OverviewCard inside ExerciseOverview renders a Link, we need to wrap in a BrowserRouter
        const queryClient = new QueryClient();
        render(
            <BrowserRouter>
                <QueryClientProvider client={queryClient}>
                    <ExerciseOverview />
                </QueryClientProvider>
            </BrowserRouter>
        );
        await act(() => Promise.resolve());

        const { getByText: categoryComponent } = within(screen.getByTestId('categories'));
        fireEvent.click(categoryComponent('exercises.legs'));

        const { getByText: equipmentComponent } = within(screen.getByTestId('equipment'));
        fireEvent.click(equipmentComponent('exercises.rocks'));

        // Assert
        expect(screen.getByText('Squats')).toBeInTheDocument();
        expect(screen.getByText('Benchpress')).toBeInTheDocument();
        expect(screen.queryByText('Curls')).not.toBeInTheDocument();
        expect(screen.queryByText('Crunches')).not.toBeInTheDocument();
        expect(screen.queryByText('Skull crusher')).not.toBeInTheDocument();
    });

});
