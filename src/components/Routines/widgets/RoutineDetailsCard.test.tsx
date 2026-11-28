import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from '@testing-library/react';
import { useRoutineDetailQuery } from "@/components/Routines/queries";
import { RoutineDetailsCard } from "@/components/Routines/widgets/RoutineDetailsCard";
import React from 'react';
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { testRoutine1 } from "@/tests/workoutRoutinesTestData";
import { Routine } from "@/components/Routines/models/Routine";
import type { Mock } from 'vitest';

vi.mock("@/components/Exercises/api/language");
vi.mock("@/components/Routines/queries");

const queryClient = new QueryClient();

describe("Test the RoutineDetail component", () => {

    beforeEach(() => {
        (useRoutineDetailQuery as Mock).mockImplementation(() => ({
            isSuccess: true,
            isLoading: false,
            data: testRoutine1
        }));
    });

    test('renders a specific routine', async () => {

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={['/routine/101']}>
                    <Routes>
                        <Route path="routine/:routineId" element={<RoutineDetailsCard />} />
                    </Routes>
                </MemoryRouter>
            </QueryClientProvider>
        );

        // Assert
        expect(useRoutineDetailQuery).toHaveBeenCalledWith(101);
        expect(screen.getByText('Full body routine')).toBeInTheDocument();
        expect(screen.getByText('Every day is leg day 🦵🏻')).toBeInTheDocument();
        expect(screen.getByText('Squats')).toBeInTheDocument();
    });

    test('renders days the sequence has no data for', async () => {

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={['/routine/101']}>
                    <Routes>
                        <Route path="routine/:routineId" element={<RoutineDetailsCard />} />
                    </Routes>
                </MemoryRouter>
            </QueryClientProvider>
        );

        // Assert: only the leg day has data, the other two are in the structure only
        expect(screen.getByText('Pull day')).toBeInTheDocument();
        expect(screen.getByText('routines.restDay')).toBeInTheDocument();
    });

    test.each([
        ['with sequence data', testRoutine1],
        ['without sequence data', new Routine({ ...testRoutine1, dayData: [] })],
    ])('links the exercises to their detail page (%s)', async (_, routine) => {

        // Arrange
        (useRoutineDetailQuery as Mock).mockImplementation(() => ({
            isSuccess: true,
            isLoading: false,
            data: routine
        }));

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={['/routine/101']}>
                    <Routes>
                        <Route path="routine/:routineId" element={<RoutineDetailsCard />} />
                    </Routes>
                </MemoryRouter>
            </QueryClientProvider>
        );

        // Assert
        expect(screen.getByRole('link', { name: 'Squats' })).toHaveAttribute(
            'href',
            expect.stringMatching(/\/exercise\/345\/view\/squats$/)
        );
    });
});
