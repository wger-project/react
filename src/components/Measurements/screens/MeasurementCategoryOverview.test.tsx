import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from '@testing-library/react';
import { useMeasurementsCategoryQuery } from "@/components/Measurements/queries";
import { MeasurementCategoryOverview } from "@/components/Measurements/screens/MeasurementCategoryOverview";
import React from 'react';
import { BrowserRouter } from "react-router-dom";
import { TEST_MEASUREMENT_CATEGORY_1, TEST_MEASUREMENT_CATEGORY_2 } from "@/tests/measurementsTestData";
import type { Mock } from 'vitest';

vi.mock("@/components/Measurements/queries");

const queryClient = new QueryClient();

describe("Test the MeasurementCategoryOverview component", () => {

    const { ResizeObserver } = window;

    beforeEach(() => {
        (useMeasurementsCategoryQuery as Mock).mockImplementation(() => ({
            isSuccess: true,
            isLoading: false,
            data: [TEST_MEASUREMENT_CATEGORY_1, TEST_MEASUREMENT_CATEGORY_2]
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
});
