import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TEST_MEASUREMENT_CATEGORY_1 } from "tests/measurementsTestData";
import { MemoryRouter, Route, Routes } from "react-router";
import { MeasurementCategoryDetail } from "components/Measurements/Overview/MeasurementCategoryDetail";
import { useMeasurementsQuery } from "components/Measurements/queries";

jest.mock("components/Measurements/queries");


const queryClient = new QueryClient();

describe("Test the MeasurementCategoryDetail component", () => {

    // See https://github.com/maslianok/react-resize-detector#testing-with-enzyme-and-jest
    const { ResizeObserver } = window;

    beforeEach(() => {

        // @ts-ignore
        useMeasurementsQuery.mockImplementation(() => ({
            isSuccess: true,
            isLoading: false,
            data: TEST_MEASUREMENT_CATEGORY_1
        }));

        // @ts-ignore
        delete window.ResizeObserver;
        window.ResizeObserver = jest.fn().mockImplementation(() => ({
            observe: jest.fn(),
            unobserve: jest.fn(),
            disconnect: jest.fn()
        }));
    });

    afterEach(() => {
        window.ResizeObserver = ResizeObserver;
        jest.restoreAllMocks();
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

        expect(screen.getByText('10cm')).toBeInTheDocument();
        expect(screen.getByText(/feb 1, 2023/i)).toBeInTheDocument();
        expect(screen.getByText('test note')).toBeInTheDocument();
        
        expect(screen.getByText('20cm')).toBeInTheDocument();
        expect(screen.getByText(/feb 2, 2023/i)).toBeInTheDocument();
        expect(screen.getByText('important note')).toBeInTheDocument();
    });
});
