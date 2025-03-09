import { QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen } from '@testing-library/react';
import { RoutineOverview } from "components/WorkoutRoutines/Overview/RoutineOverview";
import React from 'react';
import { BrowserRouter } from "react-router-dom";
import { getRoutinesShallow } from "services";
import { testQueryClient } from "tests/queryClient";
import { TEST_ROUTINES } from "tests/workoutRoutinesTestData";

jest.mock("services");

describe("Smoke tests the RoutineOverview component", () => {

    beforeEach(() => {
        (getRoutinesShallow as jest.Mock).mockResolvedValue(TEST_ROUTINES);
    });

    test('renders all routines', async () => {

        // Act
        render(
            <BrowserRouter>
                <QueryClientProvider client={testQueryClient}>
                    <RoutineOverview />
                </QueryClientProvider>
            </BrowserRouter>
        );
        await act(async () => {
            await new Promise((r) => setTimeout(r, 20));
        });

        // Assert
        expect(getRoutinesShallow).toHaveBeenCalledTimes(1);
        expect(screen.getByText('Test routine 1')).toBeInTheDocument();
        expect(screen.getByText('routines.routine')).toBeInTheDocument();
        expect(screen.getByText('routines.routines')).toBeInTheDocument();
    });
});
