import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from '@testing-library/react';
import { RoutineCard } from "@/components/Dashboard/RoutineCard";
import { useActiveRoutineQuery } from "@/components/Routines";
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

    describe("The query failed", () => {

        beforeEach(() => {
            (useActiveRoutineQuery as Mock).mockImplementation(() => ({
                isSuccess: false,
                isLoading: false,
                isError: true,
                data: undefined
            }));
        });

        test('falls back to the call to action instead of crashing', async () => {

            // Act
            render(
                <QueryClientProvider client={testQueryClient}>
                    <RoutineCard />
                </QueryClientProvider>
            );

            // Assert
            expect(screen.getByText('nothingHereYet')).toBeInTheDocument();
        });
    });

    describe("The query is loading", () => {

        beforeEach(() => {
            (useActiveRoutineQuery as Mock).mockImplementation(() => ({
                isSuccess: false,
                isLoading: true,
                data: undefined
            }));
        });

        test('shows the loading placeholder', async () => {

            // Act
            render(
                <QueryClientProvider client={testQueryClient}>
                    <RoutineCard />
                </QueryClientProvider>
            );

            // Assert
            expect(screen.getByRole('progressbar')).toBeInTheDocument();
            expect(screen.queryByText('nothingHereYet')).not.toBeInTheDocument();
        });
    });
});


