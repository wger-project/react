import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from '@testing-library/react';
import { MeasurementCard } from "@/components/Dashboard/MeasurementCard";
import {
    MeasurementCategory,
    useMeasurementEntriesQuery,
    useMeasurementsCategoryQuery
} from "@/components/Measurements";
import { MeasurementEntry } from "@/components/Measurements/models/Entry";
import {
    TEST_MEASUREMENT_CATEGORY_1,
    TEST_MEASUREMENT_CATEGORY_2,
    TEST_MEASUREMENT_SEED_1,
    TEST_MEASUREMENT_SEED_2
} from "@/tests/measurementsTestData";
import type { Mock } from 'vitest';

import { mockChartQueries } from "@/tests/chartQueries";
vi.mock("@/components/Measurements/queries");
vi.useFakeTimers();

const queryClient = new QueryClient();

/** Answers the entry reads of the table under each chart, by category */
const mockEntryQueries = (byCategory: Record<string, MeasurementEntry[]>) =>
    (useMeasurementEntriesQuery as Mock).mockImplementation(
        (categoryId: string) => ({ data: byCategory[categoryId] ?? [] })
    );

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
            // The cards read their points from the aggregated queries
            mockChartQueries([TEST_MEASUREMENT_SEED_1, TEST_MEASUREMENT_SEED_2]);
            mockEntryQueries({
                [TEST_MEASUREMENT_CATEGORY_1.id!]: TEST_MEASUREMENT_SEED_1.entries,
                [TEST_MEASUREMENT_CATEGORY_2.id!]: TEST_MEASUREMENT_SEED_2.entries,
            });
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


    describe("Multi-value group", () => {

        beforeEach(() => {
            const group = new MeasurementCategory('g-1', 'Blood pressure', 'mmHg');
            const systolic = new MeasurementCategory('c-sys', 'Systolic', 'mmHg', 'blood_pressure', false, 'g-1');
            const diastolic = new MeasurementCategory('c-dia', 'Diastolic', 'mmHg', 'blood_pressure', false, 'g-1');
            group.children = [systolic, diastolic];
            const systolicEntries = [
                // sorted by date descending, like the server delivers them
                new MeasurementEntry('d-2', 'c-sys', new Date(2023, 1, 2, 8), 125, ''),
                new MeasurementEntry('d-1', 'c-sys', new Date(2023, 1, 1, 8), 120, ''),
            ];

            (useMeasurementsCategoryQuery as Mock).mockImplementation(() => ({
                isSuccess: true,
                isLoading: false,
                data: [group]
            }));
            mockChartQueries([
                { category: group },
                { category: systolic, entries: systolicEntries },
                { category: diastolic },
            ]);
            // the component row reads the newest entry, the group parent none
            mockEntryQueries({ 'c-sys': systolicEntries });
        });

        test('lists the latest reading of each component', async () => {

            // Act
            render(
                <QueryClientProvider client={queryClient}>
                    <MeasurementCard />
                </QueryClientProvider>
            );

            // Assert
            expect(screen.getAllByText('Blood pressure').length).toBeGreaterThan(0);
            expect(screen.getAllByText('Systolic').length).toBeGreaterThan(0);

            // scoped to the table, the values also appear on the chart's axis
            const table = within(screen.getByRole('table'));
            expect(table.getByText('125 mmHg')).toBeInTheDocument();
            // no reading yet for the diastolic component
            expect(table.getByText('—')).toBeInTheDocument();
            // only the latest reading is listed
            expect(table.queryByText('120 mmHg')).toBeNull();
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


