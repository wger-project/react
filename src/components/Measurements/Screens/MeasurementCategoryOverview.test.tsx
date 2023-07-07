import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { MeasurementCategoryOverview } from "components/Measurements/Screens/MeasurementCategoryOverview";
import { TEST_MEASUREMENT_CATEGORY_1, TEST_MEASUREMENT_CATEGORY_2 } from "tests/measurementsTestData";
import { useMeasurementsCategoryQuery } from "components/Measurements/queries";

jest.mock("components/Measurements/queries");

const queryClient = new QueryClient();

describe("Test the MeasurementCategoryOverview component", () => {

    const { ResizeObserver } = window;

    beforeEach(() => {
        // @ts-ignore
        useMeasurementsCategoryQuery.mockImplementation(() => ({
            isSuccess: true,
            isLoading: false,
            data: [TEST_MEASUREMENT_CATEGORY_1, TEST_MEASUREMENT_CATEGORY_2]
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


    test('renders all measurement categories correctly', async () => {

        // Act
        render(
            <BrowserRouter>
                <QueryClientProvider client={queryClient}>
                    <MeasurementCategoryOverview />
                </QueryClientProvider>
            </BrowserRouter>
        );
        await act(async () => {
            await new Promise((r) => setTimeout(r, 20));
        });

        // Assert
        expect(useMeasurementsCategoryQuery).toHaveBeenCalledTimes(1);
        expect(screen.getByText('measurements.measurements')).toBeInTheDocument();
        expect(screen.getByText('Biceps')).toBeInTheDocument();
        expect(screen.getByText('Body fat')).toBeInTheDocument();
    });
});
