import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen } from '@testing-library/react';
import { RoutineOverview } from "components/WorkoutRoutines/Overview/RoutineOverview";
import React from 'react';
import { BrowserRouter } from "react-router-dom";
import { getWorkoutRoutinesShallow } from "services";
import { TEST_ROUTINES } from "tests/workoutRoutinesTestData";

jest.mock("services");

const queryClient = new QueryClient();

describe("Test the RoutineOverview component", () => {

    beforeEach(() => {
        // @ts-expect-error mock will exist when this is run
        getWorkoutRoutinesShallow.mockImplementation(() => Promise.resolve(TEST_ROUTINES));
    });


    test('renders all routines', async () => {

        // Act
        render(
            <BrowserRouter>
                <QueryClientProvider client={queryClient}>
                    <RoutineOverview />
                </QueryClientProvider>
            </BrowserRouter>
        );
        await act(async () => {
            await new Promise((r) => setTimeout(r, 20));
        });

        // Assert
        expect(getWorkoutRoutinesShallow).toHaveBeenCalledTimes(1);
        expect(screen.getByText('Test routine 1')).toBeInTheDocument();
        expect(screen.getByText('routines.routine')).toBeInTheDocument();
        expect(screen.getByText('routines.routines')).toBeInTheDocument();
    });
});
