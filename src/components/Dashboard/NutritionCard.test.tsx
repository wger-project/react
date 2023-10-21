import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from '@testing-library/react';
import { NutritionCard } from "components/Dashboard/NutritionCard";
import { useFetchLastNutritionalPlanIdQuery, useFetchNutritionalPlanDateQuery } from "components/Nutrition/queries";
import { TEST_NUTRITIONAL_PLAN_1 } from "tests/nutritionTestdata";

jest.mock("components/Nutrition/queries");
jest.useFakeTimers();

const { ResizeObserver } = window;
const queryClient = new QueryClient();

describe("test the NutritionCard component", () => {

    describe("Plans available", () => {

        beforeEach(() => {
            // @ts-ignore
            useFetchLastNutritionalPlanIdQuery.mockImplementation(() => ({
                isSuccess: true,
                isLoading: false,
                data: 123
            }));

            // @ts-ignore
            useFetchNutritionalPlanDateQuery.mockImplementation(() => ({
                isSuccess: true,
                isLoading: false,
                data: TEST_NUTRITIONAL_PLAN_1
            }));

            jest.setSystemTime(new Date('2023-09-01'));

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

        test('renders the current nutritional plan correctly', async () => {

            // Act
            render(
                <QueryClientProvider client={queryClient}>
                    <NutritionCard />
                </QueryClientProvider>
            );

            // Assert
            expect(useFetchLastNutritionalPlanIdQuery).toHaveBeenCalled();
            expect(useFetchNutritionalPlanDateQuery).toHaveBeenCalledWith(123, "2023-09-01", true);
            expect(screen.getByText('Second breakfast')).toBeInTheDocument();
            expect(screen.getByText('evening snack')).toBeInTheDocument();
            expect(screen.getByText('breakfast')).toBeInTheDocument();
        });
    });


    describe("No plans available", () => {

        beforeEach(() => {
            // @ts-ignore
            useFetchLastNutritionalPlanIdQuery.mockImplementation(() => ({
                isSuccess: true,
                isLoading: false,
                data: null
            }));

            // @ts-ignore
            useFetchNutritionalPlanDateQuery.mockImplementation(() => ({
                isSuccess: true,
                isLoading: false,
                data: null
            }));
        });

        test('renders the current nutritional plan correctly', async () => {

            // Act
            render(
                <QueryClientProvider client={queryClient}>
                    <NutritionCard />
                </QueryClientProvider>
            );

            // Assert
            expect(useFetchLastNutritionalPlanIdQuery).toHaveBeenCalled();
            expect(useFetchNutritionalPlanDateQuery).toHaveBeenCalledWith(null, expect.any(String), true);
            expect(screen.getByText('nothingHereYet')).toBeInTheDocument();
            expect(screen.getByText('nothingHereYetAction')).toBeInTheDocument();
            expect(screen.getByText('add')).toBeInTheDocument();
        });
    });

});


