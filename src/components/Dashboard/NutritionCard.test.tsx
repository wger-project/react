import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from '@testing-library/react';
import { NutritionCard } from "@/components/Dashboard/NutritionCard";
import { useFetchLastNutritionalPlanQuery } from "@/components/Nutrition/queries";
import { TEST_NUTRITIONAL_PLAN_1 } from "@/tests/nutritionTestdata";
import type { Mock } from 'vitest';

vi.mock("@/components/Nutrition/queries");
vi.useFakeTimers();

const queryClient = new QueryClient();

describe("test the NutritionCard component", () => {

    describe("Plans available", () => {

        beforeEach(() => {
            (useFetchLastNutritionalPlanQuery as Mock).mockImplementation(() => ({
                isSuccess: true,
                isLoading: false,
                data: TEST_NUTRITIONAL_PLAN_1
            }));

            vi.setSystemTime(new Date('2023-09-01').getTime());
        });

        afterEach(() => {
            vi.restoreAllMocks();
            vi.useRealTimers();
        });

        test('renders the current nutritional plan correctly', async () => {

            // Act
            render(
                <QueryClientProvider client={queryClient}>
                    <NutritionCard />
                </QueryClientProvider>
            );

            // Assert
            expect(useFetchLastNutritionalPlanQuery).toHaveBeenCalled();
            expect(screen.getByText('Second breakfast')).toBeInTheDocument();
            expect(screen.getByText('evening snack')).toBeInTheDocument();
            expect(screen.getByText('breakfast')).toBeInTheDocument();
        });
    });

    describe("No plans available", () => {

        beforeEach(() => {
            (useFetchLastNutritionalPlanQuery as Mock).mockImplementation(() => ({
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
            expect(useFetchLastNutritionalPlanQuery).toHaveBeenCalled();
            expect(screen.getByText('nothingHereYet')).toBeInTheDocument();
            expect(screen.getByText('nothingHereYetAction')).toBeInTheDocument();
            expect(screen.getByText('add')).toBeInTheDocument();
        });
    });

});

