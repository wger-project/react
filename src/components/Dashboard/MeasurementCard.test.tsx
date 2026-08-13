import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from '@testing-library/react';
import { MeasurementCard } from "@/components/Dashboard/MeasurementCard";
import { useMeasurementsCategoryQuery } from "@/components/Measurements";
import { TEST_MEASUREMENT_CATEGORY_1, TEST_MEASUREMENT_CATEGORY_2 } from "@/tests/measurementsTestData";
import type { Mock } from 'vitest';

vi.mock("@/components/Measurements/queries");
vi.useFakeTimers();

const queryClient = new QueryClient();

describe("smoke test the MeasurementCard component", () => {

    describe("Measurements available", () => {

        beforeEach(() => {
            (useMeasurementsCategoryQuery as Mock).mockImplementation(() => ({
                isSuccess: true,
                isLoading: false,
                data: [
                    TEST_MEASUREMENT_CATEGORY_1,
                    TEST_MEASUREMENT_CATEGORY_2
                ]
            }));
        });

        test('renders the current categories correctly', async () => {

            // Act
            render(
                <QueryClientProvider client={queryClient}>
                    <MeasurementCard />
                </QueryClientProvider>
            );

            // Assert
            expect(useMeasurementsCategoryQuery).toHaveBeenCalled();
            expect(screen.getAllByText('Biceps').length).toBeGreaterThan(0);
            expect(screen.getAllByText('11 %').length).toBeGreaterThan(0);
            expect(screen.getAllByText('22 %').length).toBeGreaterThan(0);
            expect(screen.getAllByText('33 %').length).toBeGreaterThan(0);
            expect(screen.getAllByText('44 %').length).toBeGreaterThan(0);
        });
    });


    describe("No data available", () => {

        beforeEach(() => {
            // A new user without any categories gets an empty list from the API
            (useMeasurementsCategoryQuery as Mock).mockImplementation(() => ({
                isSuccess: true,
                isLoading: false,
                data: []
            }));
        });

        test('renders the overview correctly', async () => {

            // Act
            render(
                <QueryClientProvider client={queryClient}>
                    <MeasurementCard />
                </QueryClientProvider>
            );

            // Assert
            expect(useMeasurementsCategoryQuery).toHaveBeenCalled();
            expect(screen.getByText('nothingHereYet')).toBeInTheDocument();
            expect(screen.getByText('nothingHereYetAction')).toBeInTheDocument();
            expect(screen.getByText('add')).toBeInTheDocument();
        });
    });

    describe("The query failed", () => {

        beforeEach(() => {
            (useMeasurementsCategoryQuery as Mock).mockImplementation(() => ({
                isSuccess: false,
                isLoading: false,
                isError: true,
                data: undefined
            }));
        });

        test('falls back to the empty card instead of crashing', async () => {

            // Act
            render(
                <QueryClientProvider client={queryClient}>
                    <MeasurementCard />
                </QueryClientProvider>
            );

            // Assert
            expect(screen.getByText('nothingHereYet')).toBeInTheDocument();
        });
    });

    describe("The query is loading", () => {

        beforeEach(() => {
            (useMeasurementsCategoryQuery as Mock).mockImplementation(() => ({
                isSuccess: false,
                isLoading: true,
                data: undefined
            }));
        });

        test('shows the loading placeholder', async () => {

            // Act
            render(
                <QueryClientProvider client={queryClient}>
                    <MeasurementCard />
                </QueryClientProvider>
            );

            // Assert
            expect(screen.getByRole('progressbar')).toBeInTheDocument();
            expect(screen.queryByText('nothingHereYet')).not.toBeInTheDocument();
        });
    });
});


