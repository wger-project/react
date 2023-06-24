import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getMeasurementCategories } from "services";
import { BrowserRouter } from "react-router-dom";
import { MeasurementCategoryOverview } from "components/Measurements/Overview/MeasurementCategoryOverview";
import { TEST_MEASUREMENT_CATEGORY_1, TEST_MEASUREMENT_CATEGORY_2 } from "tests/measurementsTestData";

jest.mock("services");

const queryClient = new QueryClient();

describe("Test the MeasurementCategoryOverview component", () => {

    beforeEach(() => {
        // @ts-ignore
        getMeasurementCategories.mockImplementation(() => Promise.resolve(
            [TEST_MEASUREMENT_CATEGORY_1, TEST_MEASUREMENT_CATEGORY_2]
        ));
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
        expect(getMeasurementCategories).toHaveBeenCalledTimes(1);
        expect(screen.getByText('Biceps')).toBeInTheDocument();
        expect(screen.getByText('Body fat')).toBeInTheDocument();
    });
});
