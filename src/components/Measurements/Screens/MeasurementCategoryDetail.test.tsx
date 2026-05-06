import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from '@testing-library/react';
import { useMeasurementsQuery } from "@/components/Measurements/queries";
import { MeasurementCategoryDetail } from "@/components/Measurements/Screens/MeasurementCategoryDetail";
import React from 'react';
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { TEST_MEASUREMENT_CATEGORY_1 } from "@/tests/measurementsTestData";
import type { Mock } from 'vitest';

vi.mock("@/components/Measurements/queries");

const queryClient = new QueryClient();

describe("Test the MeasurementCategoryDetail component", () => {

    // See https://github.com/maslianok/react-resize-detector#testing-with-enzyme-and-jest
    const { ResizeObserver } = window;

    beforeEach(() => {

        (useMeasurementsQuery as Mock).mockImplementation(() => ({
            isSuccess: true,
            isLoading: false,
            data: TEST_MEASUREMENT_CATEGORY_1
        }));
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

        screen.logTestingPlaygroundURL();

        // Assert
        expect(useMeasurementsQuery).toHaveBeenCalled();
        expect(screen.getByText('Biceps')).toBeInTheDocument();

        expect(screen.getByRole('gridcell', { name: /10cm/i })).toBeInTheDocument();
        expect(screen.getAllByText(/Feb 1, 2023/i).length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText('test note')).toBeInTheDocument();

        expect(screen.getByRole('gridcell', { name: /20cm/i })).toBeInTheDocument();
        expect(screen.getByText(/Feb 2, 2023/i)).toBeInTheDocument();
        expect(screen.getByText('important note')).toBeInTheDocument();
    });
});
