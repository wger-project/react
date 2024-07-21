import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { ExerciseOverview } from "components/Exercises/ExerciseOverview";
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { getCategories, getEquipment, getExercises, getLanguages, getMuscles } from "services";
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

const queryClient = new QueryClient();

describe("Test the ExerciseOverview component", () => {


    beforeEach(() => {
        // @ts-expect-error mock will exist when this is run
        getLanguages.mockImplementation(() => Promise.resolve(testLanguages));
        // @ts-expect-error mock will exist when this is run
        getCategories.mockImplementation(() => Promise.resolve(testCategories));
        // @ts-expect-error mock will exist when this is run
        getMuscles.mockImplementation(() => Promise.resolve(testMuscles));
        // @ts-expect-error mock will exist when this is run
        getEquipment.mockImplementation(() => Promise.resolve(testEquipment));
        // @ts-expect-error mock will exist when this is run
        getExercises.mockImplementation(() => Promise.resolve([
            testExerciseSquats,
            testExerciseBenchPress,
            testExerciseCurls,
            testExerciseCrunches,
            testExerciseSkullCrusher
        ]));
    });


    test('renders all exercises', async () => {

        // Act
        render(
            <BrowserRouter>
                <QueryClientProvider client={queryClient}>
                    <ExerciseOverview />
                </QueryClientProvider>
            </BrowserRouter>
        );
        await act(async () => {
            await new Promise((r) => setTimeout(r, 20));
        });

        // Assert
        expect(getCategories).toHaveBeenCalledTimes(1);
        expect(getMuscles).toHaveBeenCalledTimes(1);
        expect(getEquipment).toHaveBeenCalledTimes(1);
        expect(getExercises).toHaveBeenCalledTimes(1);

        expect(screen.getByText('Benchpress')).toBeInTheDocument();
        expect(screen.getByText('Squats')).toBeInTheDocument();
        expect(screen.getByText('Curls')).toBeInTheDocument();
        expect(screen.getByText('Crunches')).toBeInTheDocument();
        expect(screen.getByText('Skull crusher')).toBeInTheDocument();
    });

    test('filter one category', async () => {

        // Act
        render(
            <BrowserRouter>
                <QueryClientProvider client={queryClient}>
                    <ExerciseOverview />
                </QueryClientProvider>
            </BrowserRouter>
        );
        await act(() => Promise.resolve());
        const { getByText: categoriesComponent } = within(screen.getByTestId('categories'));
        fireEvent.click(categoriesComponent("server.arms"));

        // Assert
        expect(screen.queryByText('Benchpress')).not.toBeInTheDocument();
        expect(screen.queryByText('Squats')).not.toBeInTheDocument();
        expect(screen.getByText('Curls')).toBeInTheDocument();
        expect(screen.queryByText('Crunches')).not.toBeInTheDocument();
        expect(screen.getByText('Skull crusher')).toBeInTheDocument();
    });

    test('filter two categories', async () => {

        // Act
        render(
            <BrowserRouter>
                <QueryClientProvider client={queryClient}>
                    <ExerciseOverview />
                </QueryClientProvider>
            </BrowserRouter>
        );
        await act(() => Promise.resolve());
        const { getByText: categoriesComponent } = within(screen.getByTestId('categories'));
        fireEvent.click(categoriesComponent("server.arms"));
        fireEvent.click(categoriesComponent("server.legs"));

        // Assert
        expect(screen.getByText('Squats')).toBeInTheDocument();
        expect(screen.getByText('Benchpress')).toBeInTheDocument();
        expect(screen.getByText('Curls')).toBeInTheDocument();
        expect(screen.queryByText('Crunches')).not.toBeInTheDocument();
        expect(screen.getByText('Skull crusher')).toBeInTheDocument();
    });

    test('filter equipment', async () => {

        // Act
        render(
            <BrowserRouter>
                <QueryClientProvider client={queryClient}>
                    <ExerciseOverview />
                </QueryClientProvider>
            </BrowserRouter>
        );
        await act(() => Promise.resolve());
        const { getByText: equipmentComponent } = within(screen.getByTestId('equipment'));
        fireEvent.click(equipmentComponent("server.barbell"));

        // Assert
        expect(screen.getByText('Squats')).toBeInTheDocument();
        expect(screen.getByText('Benchpress')).toBeInTheDocument();
        expect(screen.queryByText('Curls')).not.toBeInTheDocument();
        expect(screen.queryByText('Crunches')).not.toBeInTheDocument();
        expect(screen.getByText('Skull crusher')).toBeInTheDocument();
    });

    test('filter muscles', async () => {

        // Act
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
        render(
            <BrowserRouter>
                <QueryClientProvider client={queryClient}>
                    <ExerciseOverview />
                </QueryClientProvider>
            </BrowserRouter>
        );
        await act(() => Promise.resolve());

        const { getByText: categoryComponent } = within(screen.getByTestId('categories'));
        fireEvent.click(categoryComponent('server.legs'));

        const { getByText: equipmentComponent } = within(screen.getByTestId('equipment'));
        fireEvent.click(equipmentComponent('server.rocks'));

        // Assert
        expect(screen.getByText('Squats')).toBeInTheDocument();
        expect(screen.getByText('Benchpress')).toBeInTheDocument();
        expect(screen.queryByText('Curls')).not.toBeInTheDocument();
        expect(screen.queryByText('Crunches')).not.toBeInTheDocument();
        expect(screen.queryByText('Skull crusher')).not.toBeInTheDocument();
    });

});
