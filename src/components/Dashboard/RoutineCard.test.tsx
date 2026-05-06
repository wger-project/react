import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from '@testing-library/react';
import { RoutineCard } from "@/components/Dashboard/RoutineCard";
import { useActiveRoutineQuery } from "@/components/Routines/queries";
import { testQueryClient } from "@/tests/queryClient";
import { testRoutine1 } from "@/tests/workoutRoutinesTestData";
import type { Mock } from 'vitest';

vi.mock("@/components/Routines/queries");
vi.useFakeTimers();

describe("test the RoutineCard component", () => {

    describe("Routines are available", () => {
        beforeEach(() => {
            (useActiveRoutineQuery as Mock).mockImplementation(() => ({
                isSuccess: true,
                isLoading: false,
                data: testRoutine1
            }));
        });

        test('renders the current routine correctly', async () => {
            // Act
            render(
                <QueryClientProvider client={testQueryClient}>
                    <RoutineCard />
                </QueryClientProvider>
            );

            // Assert
            expect(useActiveRoutineQuery).toHaveBeenCalled();
            expect(screen.getByText('Test routine 1')).toBeInTheDocument();
            expect(screen.getByText('Every day is leg day 🦵🏻')).toBeInTheDocument();
        });
    });


    describe("No routines available", () => {

        beforeEach(() => {
            (useActiveRoutineQuery as Mock).mockImplementation(() => ({
                isSuccess: true,
                isLoading: false,
                data: null
            }));
        });

        test('renders the call to action correctly', async () => {

            // Act
            render(
                <QueryClientProvider client={testQueryClient}>
                    <RoutineCard />
                </QueryClientProvider>
            );

            // Assert
            expect(useActiveRoutineQuery).toHaveBeenCalled();
            expect(screen.getByText('nothingHereYet')).toBeInTheDocument();
            expect(screen.getByText('nothingHereYetAction')).toBeInTheDocument();
            expect(screen.getByText('add')).toBeInTheDocument();
        });
    });
});


