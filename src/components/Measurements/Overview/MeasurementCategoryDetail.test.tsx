import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getMeasurementCategory } from "services";
import { MeasurementCategoryOverview } from "components/Measurements/Overview/MeasurementCategoryOverview";
import { TEST_MEASUREMENT_CATEGORY_1 } from "tests/measurementsTestData";
import { MemoryRouter, Route, Routes } from "react-router";
import { useRoutineDetailQuery } from "components/WorkoutRoutines/queries";

jest.mock("services");

const queryClient = new QueryClient();

describe("Test the MeasurementCategoryDetail component", () => {

    beforeEach(() => {
        // @ts-ignore
        getMeasurementCategory.mockImplementation(() => Promise.resolve(TEST_MEASUREMENT_CATEGORY_1));
    });


    test('renders the current category correctly', async () => {

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={['/measurement/category/42']}>
                    <Routes>
                        <Route path="measurement/category/:categoryId" element={<MeasurementCategoryOverview />} />
                    </Routes>
                </MemoryRouter>
            </QueryClientProvider>
        );
        // await act(async () => {
        //     await new Promise((r) => setTimeout(r, 20));
        // });

        // Assert
        expect(useRoutineDetailQuery).toHaveBeenCalledWith(42);
        expect(screen.getByText('Biceps')).toBeInTheDocument();
        expect(screen.getByText('10')).toBeInTheDocument();
        expect(screen.getByText('test note')).toBeInTheDocument();
        expect(screen.getByText('important note')).toBeInTheDocument();
        expect(screen.getByText('this day was good')).toBeInTheDocument();
    });
});
