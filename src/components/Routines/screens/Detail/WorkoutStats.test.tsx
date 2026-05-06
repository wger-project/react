import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from '@testing-library/react';
import { WorkoutStats } from "@/components/Routines/screens/Detail/WorkoutStats";
import { RoutineStatsData } from "@/components/Routines/models/LogStats";
import React from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { getLanguages, getMuscles, getRoutine, getRoutineStatisticsData } from "@/services";
import { testLanguages, testMuscles } from "@/tests/exerciseTestdata";
import { getTestQueryClient } from "@/tests/queryClient";
import { testRoutine1 } from "@/tests/workoutRoutinesTestData";
import type { Mock } from 'vitest';

vi.mock("@/services");

describe("Smoke tests the WorkoutStats component", () => {

    beforeEach(() => {
        (getRoutineStatisticsData as Mock).mockResolvedValue(new RoutineStatsData());
        (getRoutine as Mock).mockResolvedValue(testRoutine1);
        (getLanguages as Mock).mockResolvedValue(testLanguages);
        (getMuscles as Mock).mockResolvedValue(testMuscles);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('renders the statistics page', async () => {

        // Act
        render(
            <QueryClientProvider client={getTestQueryClient()}>
                <MemoryRouter initialEntries={['/test/101']}>
                    <Routes>
                        <Route path="/test/:routineId" element={<WorkoutStats />} />
                    </Routes>
                </MemoryRouter>
            </QueryClientProvider>
        );

        // Assert
        await waitFor(() => {
            expect(getRoutineStatisticsData).toHaveBeenCalledTimes(1);
            expect(getRoutine).toHaveBeenCalledTimes(1);
            expect(getLanguages).toHaveBeenCalledTimes(1);
            expect(getMuscles).toHaveBeenCalledTimes(1);
        });
        await waitFor(() => {
            expect(screen.getByText('routines.statsOverview - Test routine 1')).toBeInTheDocument();
        });
        expect(screen.getByText('routines.volume')).toBeInTheDocument();
        expect(screen.getByText('routines.daily')).toBeInTheDocument();
        expect(screen.getByText('exercises.exercises')).toBeInTheDocument();
    });
});
