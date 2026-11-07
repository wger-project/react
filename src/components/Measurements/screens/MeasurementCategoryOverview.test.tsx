import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import {
    useLatestMeasurementEntriesQuery,
    useMeasurementsCategoryQuery,
    useReorderMeasurementCategoriesQuery
} from "@/components/Measurements/queries";
import { MeasurementCategoryOverview } from "@/components/Measurements/screens/MeasurementCategoryOverview";
import React from 'react';
import { BrowserRouter } from "react-router-dom";
import { mockChartQueries } from "@/tests/chartQueries";
import { MeasurementEntry } from "@/components/Measurements/models/Entry";
import {
    TEST_MEASUREMENT_CATEGORY_1,
    TEST_MEASUREMENT_CATEGORY_2,
    TEST_MEASUREMENT_SEED_1,
    TEST_MEASUREMENT_SEED_2
} from "@/tests/measurementsTestData";
import type { Mock } from 'vitest';

vi.mock("@/components/Measurements/queries");

const queryClient = new QueryClient();

describe("Test the MeasurementCategoryOverview component", () => {

    beforeEach(() => {
        (useMeasurementsCategoryQuery as Mock).mockImplementation(() => ({
            isSuccess: true,
            isLoading: false,
            data: [TEST_MEASUREMENT_CATEGORY_1, TEST_MEASUREMENT_CATEGORY_2]
        }));
        (useReorderMeasurementCategoriesQuery as Mock).mockImplementation(() => ({
            mutate: vi.fn()
        }));
        // The card headers show the newest entry of their category
        (useLatestMeasurementEntriesQuery as Mock).mockImplementation((ids: string[]) => ({
            data: [new MeasurementEntry(
                '22222222-2222-4222-8222-222222222222', ids[0], new Date(), 42.5, '',
            )]
        }));
        // The cards read their points from the aggregated queries
        mockChartQueries([TEST_MEASUREMENT_SEED_1, TEST_MEASUREMENT_SEED_2]);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('renders all measurement categories correctly', async () => {

        // Act
        render(
            <BrowserRouter>
                <QueryClientProvider client={queryClient}>
                    <MeasurementCategoryOverview />
                </QueryClientProvider>
            </BrowserRouter>
        );
        // Assert
        await waitFor(() => expect(useMeasurementsCategoryQuery).toHaveBeenCalledTimes(1));
        expect(await screen.findByText('Biceps')).toBeInTheDocument();
        expect(screen.getByText('measurements.measurements')).toBeInTheDocument();
        expect(screen.getByText('Body fat')).toBeInTheDocument();

        // The whole card links to its category
        expect(screen.getByText('Biceps').closest('a')).toHaveAttribute(
            'href',
            expect.stringContaining(`/measurement/category/${TEST_MEASUREMENT_CATEGORY_1.id}`)
        );

        // The header carries the newest value in the category's unit; the
        // decimal separator follows the runtime locale
        expect(screen.getByText(/42[.,]5 cm/)).toBeInTheDocument();
        expect(screen.getByText(/42[.,]5 %/)).toBeInTheDocument();
    });

    test('the add button waits while the categories are read again', async () => {

        // Arrange: a new category invalidates the query, and reading the
        // histories again takes long enough that the button has to say so
        (useMeasurementsCategoryQuery as Mock).mockImplementation(() => ({
            isSuccess: true,
            isLoading: false,
            isFetching: true,
            data: [TEST_MEASUREMENT_CATEGORY_1, TEST_MEASUREMENT_CATEGORY_2]
        }));

        // Act
        render(
            <BrowserRouter>
                <QueryClientProvider client={queryClient}>
                    <MeasurementCategoryOverview />
                </QueryClientProvider>
            </BrowserRouter>
        );

        // Assert - the quick-add buttons on the cards carry the same label,
        // so the fab is told apart by its class
        const fab = screen.getAllByLabelText('add').find(b => b.classList.contains('MuiFab-root'))!;
        expect(fab).toBeDefined();
        expect(fab).toBeDisabled();
        expect(fab.querySelector('[data-testid="AddIcon"]')).toBeNull();
        expect(fab.querySelector('.MuiCircularProgress-root')).toBeInTheDocument();
    });

    test('opens the reorder modal', async () => {

        // Arrange
        render(
            <BrowserRouter>
                <QueryClientProvider client={queryClient}>
                    <MeasurementCategoryOverview />
                </QueryClientProvider>
            </BrowserRouter>
        );

        // Act
        await userEvent.click(screen.getByTestId('SortIcon').closest('button')!);

        // Assert - the modal shows the categories as a sortable list
        // (the string can also appear in the tooltip of the button itself)
        expect(screen.getAllByText('measurements.reorderCategories').length).toBeGreaterThan(0);
        // Each category now appears twice, on its card and in the sortable list
        expect(screen.getAllByText('Biceps')).toHaveLength(2);
        expect(screen.getAllByText('Body fat')).toHaveLength(2);
    });
});
