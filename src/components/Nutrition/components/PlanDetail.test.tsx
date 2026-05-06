import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from '@testing-library/react';
import { PlanDetail } from "@/components/Nutrition/components/PlanDetail";
import { useFetchNutritionalPlanQuery } from "@/components/Nutrition/queries";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { TEST_NUTRITIONAL_PLAN_1 } from "@/tests/nutritionTestdata";
import type { Mock } from 'vitest';

vi.mock("@/components/Nutrition/queries");
vi.useFakeTimers();

const queryClient = new QueryClient();

describe("Test the PlanDetail component", () => {

    beforeEach(() => {
        (useFetchNutritionalPlanQuery as Mock).mockImplementation(() => ({
            isSuccess: true,
            data: TEST_NUTRITIONAL_PLAN_1
        }));

        // @ts-expect-error
        vi.setSystemTime(new Date('2023-07-01').getTime());
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    test('renders the current nutritional plan correctly', async () => {

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={['/nutrition/101/view']}>
                    <Routes>
                        <Route path="nutrition/:planId/view" element={<PlanDetail />} />
                    </Routes>
                </MemoryRouter>
            </QueryClientProvider>
        );

        // Assert
        expect(useFetchNutritionalPlanQuery).toHaveBeenCalled();
        expect(screen.getByText('Second breakfast')).toBeInTheDocument();
        expect(screen.getByText('evening snack')).toBeInTheDocument();
        expect(screen.getByText('breakfast')).toBeInTheDocument();
    });
});
