import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RoutineOverview } from "components/WorkoutRoutines/Overview/RoutineOverview";
import { getWorkoutRoutinesShallow } from "services";
import { testRoutines } from "tests/workoutRoutinesTestData";

jest.mock("services");

const queryClient = new QueryClient();

describe("Test the RoutineOverview component", () => {


    beforeEach(() => {
        // @ts-ignore
        getWorkoutRoutinesShallow.mockImplementation(() => Promise.resolve(testRoutines));
    });


    test('renders all routines', async () => {

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <RoutineOverview />
            </QueryClientProvider>
        );
        await act(async () => {
            await new Promise((r) => setTimeout(r, 1));
        });

        // Assert
        expect(getWorkoutRoutinesShallow).toHaveBeenCalledTimes(1);
        expect(screen.getByText('Test routine 1')).toBeInTheDocument();
        expect(screen.getByText('routines.routine')).toBeInTheDocument();
        expect(screen.getByText('routines.routines')).toBeInTheDocument();
    });

});
