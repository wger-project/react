import { useMeasurementsQuery } from "@/components/Measurements/queries";
import { MeasurementCategoryDetail } from "@/components/Measurements/screens/MeasurementCategoryDetail";
import { mockChartQueries } from "@/tests/chartQueries";
import { TEST_MEASUREMENT_CATEGORY_1 } from "@/tests/measurementsTestData";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Route, Routes } from "react-router-dom";
import type { Mock } from 'vitest';

vi.mock('@/components/Nutrition/queries/plan', () => ({
    useNutritionPlanPeriods: () => [],
}));

vi.mock("@/components/Measurements/queries");

const queryClient = new QueryClient();

describe("Test the MeasurementCategoryDetail component", () => {

    beforeEach(() => {

        (useMeasurementsQuery as Mock).mockImplementation(() => ({
            isSuccess: true,
            isLoading: false,
            data: TEST_MEASUREMENT_CATEGORY_1
        }));
        // The chart reads its points from the aggregated queries
        mockChartQueries([TEST_MEASUREMENT_CATEGORY_1]);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('renders the current category correctly', async () => {

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={['/measurement/category/42']}>
                    <Routes>
                        <Route path="measurement/category/:categoryId" element={<MeasurementCategoryDetail />} />
                    </Routes>
                </MemoryRouter>
            </QueryClientProvider>
        );

        // Assert
        expect(useMeasurementsQuery).toHaveBeenCalled();
        expect(screen.getByText('Biceps')).toBeInTheDocument();

        expect(screen.getByRole('gridcell', { name: /10 cm/i })).toBeInTheDocument();
        // the entries now show date and time
        expect(screen.getAllByText(/2\/1\/2023, 8:00 AM/i).length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText('test note')).toBeInTheDocument();

        expect(screen.getByRole('gridcell', { name: /20 cm/i })).toBeInTheDocument();
        expect(screen.getByText(/2\/2\/2023, 7:45 AM/i)).toBeInTheDocument();
        expect(screen.getByText('important note')).toBeInTheDocument();
    });
});
