import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from '@testing-library/react';
import { MeasurementCard } from "components/Dashboard/MeasurementCard";
import { useMeasurementsCategoryQuery } from "components/Measurements/queries";
import { TEST_MEASUREMENT_CATEGORY_1, TEST_MEASUREMENT_CATEGORY_2 } from "tests/measurementsTestData";

jest.mock("components/Measurements/queries");
jest.useFakeTimers();

const queryClient = new QueryClient();

describe("smoke test the MeasurementCard component", () => {

    describe("Measurements available", () => {

        beforeEach(() => {
            (useMeasurementsCategoryQuery as jest.Mock).mockImplementation(() => ({
                isSuccess: true,
                isLoading: false,
                data: [
                    TEST_MEASUREMENT_CATEGORY_1,
                    TEST_MEASUREMENT_CATEGORY_2
                ]
            }));
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
            expect(screen.getAllByText('11 %').length).toBeGreaterThan(0);
            expect(screen.getAllByText('22 %').length).toBeGreaterThan(0);
            expect(screen.getAllByText('33 %').length).toBeGreaterThan(0);
            expect(screen.getAllByText('44 %').length).toBeGreaterThan(0);
        });
    });


    describe("No data available", () => {

        beforeEach(() => {
            (useMeasurementsCategoryQuery as jest.Mock).mockImplementation(() => ({
                isSuccess: true,
                isLoading: false,
                data: null
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
});


