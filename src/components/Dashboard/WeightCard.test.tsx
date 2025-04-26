import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from '@testing-library/react';
import { useBodyWeightQuery } from "components/BodyWeight/queries";
import { WeightCard } from "components/Dashboard/WeightCard";
import { testQueryClient } from "tests/queryClient";
import { testWeightEntries } from "tests/weight/testData";

jest.mock("components/BodyWeight/queries");
const { ResizeObserver } = window;

describe("test the WeightCard component", () => {

    describe("Weights are available", () => {
        beforeEach(() => {
            (useBodyWeightQuery as jest.Mock).mockImplementation(() => ({
                isSuccess: true,
                isLoading: false,
                data: testWeightEntries
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
            jest.useRealTimers();
        });

        test('renders the weights correctly', async () => {
            // Act
            render(
                <QueryClientProvider client={testQueryClient}>
                    <WeightCard />
                </QueryClientProvider>
            );

            // Assert
            expect(useBodyWeightQuery).toHaveBeenCalled();
            expect(screen.getByText('100')).toBeInTheDocument();
            expect(screen.getByText('90')).toBeInTheDocument();
            expect(screen.getByText('110')).toBeInTheDocument();
        });
    });


    describe("No weight entries available", () => {

        beforeEach(() => {
            (useBodyWeightQuery as jest.Mock).mockImplementation(() => ({
                isSuccess: true,
                isLoading: false,
                data: null
            }));
        });

        test('renders the call to action correctly', async () => {

            // Act
            render(
                <QueryClientProvider client={testQueryClient}>
                    <WeightCard />
                </QueryClientProvider>
            );

            // Assert
            expect(useBodyWeightQuery).toHaveBeenCalled();
            expect(screen.getByText('nothingHereYet')).toBeInTheDocument();
            expect(screen.getByText('nothingHereYetAction')).toBeInTheDocument();
            expect(screen.getByText('add')).toBeInTheDocument();
        });
    });
});


