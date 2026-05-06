import { ExerciseOverview } from "@/components/Exercises/screens/ExerciseOverview";
import { getCategories } from "@/components/Exercises/api/category";
import { getEquipment } from "@/components/Exercises/api/equipment";
import { getExercises } from "@/components/Exercises/api/exercise";
import { getLanguages } from "@/components/Exercises/api/language";
import { getMuscles } from "@/components/Exercises/api/muscles";
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
} from "@/tests/exerciseTestdata";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import type { Mock } from 'vitest';

vi.mock("@/components/Exercises/api/category");
vi.mock("@/components/Exercises/api/equipment");
vi.mock("@/components/Exercises/api/exercise");
vi.mock("@/components/Exercises/api/language");
vi.mock("@/components/Exercises/api/muscles");

const queryClient = new QueryClient();

describe("Test the ExerciseOverview component", () => {


    beforeEach(() => {
        (getLanguages as Mock).mockImplementation(() => Promise.resolve(testLanguages));
        (getCategories as Mock).mockImplementation(() => Promise.resolve(testCategories));
        (getMuscles as Mock).mockImplementation(() => Promise.resolve(testMuscles));
        (getEquipment as Mock).mockImplementation(() => Promise.resolve(testEquipment));
        (getExercises as Mock).mockImplementation(() => Promise.resolve([
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
        // Assert
        await waitFor(() => expect(getExercises).toHaveBeenCalledTimes(1));
        expect(getCategories).toHaveBeenCalledTimes(1);
        expect(getMuscles).toHaveBeenCalledTimes(1);
        expect(getEquipment).toHaveBeenCalledTimes(1);

        expect(await screen.findByText('Benchpress')).toBeInTheDocument();
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
        fireEvent.click(categoriesComponent("Arms"));

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
        fireEvent.click(categoriesComponent("Arms"));
        fireEvent.click(categoriesComponent("Legs"));

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
        fireEvent.click(equipmentComponent("Barbell"));

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
        fireEvent.click(categoryComponent('Legs'));

        const { getByText: equipmentComponent } = within(screen.getByTestId('equipment'));
        fireEvent.click(equipmentComponent('Rocks'));

        // Assert
        expect(screen.getByText('Squats')).toBeInTheDocument();
        expect(screen.getByText('Benchpress')).toBeInTheDocument();
        expect(screen.queryByText('Curls')).not.toBeInTheDocument();
        expect(screen.queryByText('Crunches')).not.toBeInTheDocument();
        expect(screen.queryByText('Skull crusher')).not.toBeInTheDocument();
    });

});
