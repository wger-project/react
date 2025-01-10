import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from '@testing-library/react';
import { WorkoutStats } from "components/WorkoutRoutines/Detail/WorkoutStats";
import React from "react";
import { MemoryRouter, Route, Routes } from "react-router";
import { getExercises, getLanguages, getMuscles, getRoutine } from "services";
import { testExercises, testLanguages, testMuscles } from "tests/exerciseTestdata";
import { testQueryClient } from "tests/queryClient";
import { testRoutine1 } from "tests/workoutRoutinesTestData";

jest.mock("services");

const { ResizeObserver } = window;

describe("Smoke tests the WorkoutStats component", () => {

    beforeEach(() => {
        (getRoutine as jest.Mock).mockResolvedValue(testRoutine1);
        (getLanguages as jest.Mock).mockResolvedValue(testLanguages);
        (getMuscles as jest.Mock).mockResolvedValue(testMuscles);
        (getExercises as jest.Mock).mockResolvedValue(testExercises);

        // @ts-ignore
        delete window.ResizeObserver;
        window.ResizeObserver = jest.fn().mockImplementation(() => ({
            observe: jest.fn(),
            unobserve: jest.fn(),
            disconnect: jest.fn()
        }));
    });

    afterEach(() => {
        window.ResizeObserver = ResizeObserver;
        jest.restoreAllMocks();
    });

    test('renders the statistics page', async () => {

        // Act
        render(
            <QueryClientProvider client={testQueryClient}>
                <MemoryRouter initialEntries={['/test/101']}>
                    <Routes>
                        <Route path="/test/:routineId" element={<WorkoutStats />} />
                    </Routes>
                </MemoryRouter>
            </QueryClientProvider>
        );

        // Assert
        await waitFor(() => {
            expect(getRoutine).toHaveBeenCalledTimes(1);
            expect(getLanguages).toHaveBeenCalledTimes(1);
            expect(getMuscles).toHaveBeenCalledTimes(1);
            expect(getExercises).toHaveBeenCalledTimes(1);
        });
        expect(screen.getByText('routines.statsOverview - Test routine 1')).toBeInTheDocument();
        expect(screen.getByText('routines.volume')).toBeInTheDocument();
        expect(screen.getByText('routines.daily')).toBeInTheDocument();
        expect(screen.getByText('exercises.exercises')).toBeInTheDocument();
    });
});
