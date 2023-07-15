import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router";
import { TEST_NUTRITIONAL_PLAN_2 } from "tests/nutritionTestdata";
import { PlanDetail } from "components/Nutrition/components/PlanDetail";
import { useFetchNutritionalPlanQuery } from "components/Nutrition/queries";

jest.mock("components/Nutrition/queries");

const queryClient = new QueryClient();

describe("Test the PlanDetail component", () => {

    beforeEach(() => {
        useFetchNutritionalPlanQuery.mockImplementation(() => ({
            isSuccess: true,
            data: TEST_NUTRITIONAL_PLAN_2
        }));
    });

    test('renders the current nutritional plan correctly', async () => {

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={['/nutrition/42/view']}>
                    <Routes>
                        <Route path="nutrition/:planId/view" element={<PlanDetail />} />
                    </Routes>
                </MemoryRouter>
            </QueryClientProvider>
        );

        // Assert
        expect(useFetchNutritionalPlanQuery).toHaveBeenCalled();
        expect(screen.getByText('Bulking till we puke')).toBeInTheDocument();
        expect(screen.getByText('Cake time')).toBeInTheDocument();
        expect(screen.getByText('Time to visit McDonalds')).toBeInTheDocument();
    });
});
