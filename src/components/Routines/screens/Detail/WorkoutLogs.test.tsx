import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from '@testing-library/react';
import { WorkoutLogs } from "@/components/Routines/screens/Detail/WorkoutLogs";
import {
    useDeleteRoutineLogQuery,
    useEditRoutineLogQuery,
    useRoutineDetailQuery,
    useRoutineLogData
} from "@/components/Routines/queries";
import React from 'react';
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { testRoutine1, testRoutineLogData } from "@/tests/workoutRoutinesTestData";
import type { Mock } from 'vitest';

vi.mock("@/components/Routines/queries");

const queryClient = new QueryClient();

describe("Test the RoutineLogs component", () => {

    beforeEach(() => {
        (useRoutineLogData as Mock).mockImplementation(() => ({
            isSuccess: true,
            isLoading: false,
            data: testRoutineLogData
        }));

        (useRoutineDetailQuery as Mock).mockImplementation(() => ({
            isSuccess: true,
            isLoading: false,
            data: testRoutine1
        }));

        // The log table mutates through these, they are unused until a row is edited
        (useDeleteRoutineLogQuery as Mock).mockReturnValue({ mutate: vi.fn(), isError: false });
        (useEditRoutineLogQuery as Mock).mockReturnValue({ mutate: vi.fn(), isError: false });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('renders the log page for a routine', async () => {

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={['/log/101']}>
                    <Routes>
                        <Route path="log/:routineId" element={<WorkoutLogs />} />
                    </Routes>
                </MemoryRouter>
            </QueryClientProvider>
        );

        // Assert
        expect(useRoutineDetailQuery).toHaveBeenCalledWith(101);
        expect(useRoutineLogData).toHaveBeenCalledWith(101);
        expect(screen.getByText('Every day is leg day 🦵🏻')).toBeInTheDocument();
        expect(screen.getByText('routines.addLogToDay')).toBeInTheDocument();
        expect(screen.getByText('Squats')).toBeInTheDocument();
    });

    test('groups the logs by exercise and shows them in the table', () => {

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={['/log/101']}>
                    <Routes>
                        <Route path="log/:routineId" element={<WorkoutLogs />} />
                    </Routes>
                </MemoryRouter>
            </QueryClientProvider>
        );

        // Assert
        // All fixture logs belong to the squats entry of the routine's only day, so they
        // must end up in its table. The cell values themselves can't be asserted here:
        // the DataGrid virtualises them and happy-dom reports no dimensions.
        expect(screen.getByRole('grid')).toBeInTheDocument();
        expect(screen.getAllByRole('menuitem', { name: /delete/i })).toHaveLength(testRoutineLogData[0].logs.length);
    });
});
