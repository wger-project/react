import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from '@testing-library/react';
import { PlanDetail } from "@/components/Nutrition/screens/PlanDetail";
import { useFetchNutritionalPlanQuery } from "@/components/Nutrition/queries";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { TEST_NUTRITIONAL_PLAN_1 } from "@/tests/nutritionTestdata";
import { useBodyWeightCategoryQuery, useBodyWeightQuery, useDisplayWeightUnit } from "@/components/Measurements";
import { testBodyWeightCategory, testWeightEntries } from "@/tests/weight/testData";
import type { Mock } from 'vitest';

vi.mock("@/components/Nutrition/queries");
vi.mock("@/components/Measurements/queries/bodyWeight");
vi.useFakeTimers();

const queryClient = new QueryClient();

describe("Test the PlanDetail component", () => {

    beforeEach(() => {
        (useFetchNutritionalPlanQuery as Mock).mockImplementation(() => ({
            isSuccess: true,
            data: TEST_NUTRITIONAL_PLAN_1
        }));
        (useBodyWeightQuery as Mock).mockReturnValue({ isSuccess: true, data: testWeightEntries });
        (useBodyWeightCategoryQuery as Mock).mockReturnValue({ isSuccess: true, data: testBodyWeightCategory });
        (useDisplayWeightUnit as Mock).mockReturnValue('kg');

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
