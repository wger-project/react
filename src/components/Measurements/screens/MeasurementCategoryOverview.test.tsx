import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import { useMeasurementsCategoryQuery, useReorderMeasurementCategoriesQuery } from "@/components/Measurements/queries";
import { MeasurementCategoryOverview } from "@/components/Measurements/screens/MeasurementCategoryOverview";
import React from 'react';
import { BrowserRouter } from "react-router-dom";
import { TEST_MEASUREMENT_CATEGORY_1, TEST_MEASUREMENT_CATEGORY_2 } from "@/tests/measurementsTestData";
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
