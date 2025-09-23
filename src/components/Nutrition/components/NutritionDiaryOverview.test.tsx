import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from '@testing-library/react';
import { NutritionDiaryOverview } from "components/Nutrition/components/NutritionDiaryOverview";
import { useFetchNutritionalPlanDateQuery } from "components/Nutrition/queries";
import { MemoryRouter, Route, Routes } from "react-router";
import { TEST_NUTRITIONAL_PLAN_1 } from "tests/nutritionTestdata";

jest.mock("components/Nutrition/queries");
const queryClient = new QueryClient();
describe("Test the NutritionDiaryOverview component", () => {

    beforeEach(() => {
        (useFetchNutritionalPlanDateQuery as jest.Mock).mockImplementation(() => ({
            isSuccess: true,
            isLoading: false,
            data: TEST_NUTRITIONAL_PLAN_1
        }));
    });

    test('renders the current nutritional plan correctly', async () => {

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={['/nutrition/101/2023-07-01']}>
                    <Routes>
                        <Route path="nutrition/:planId/:date" element={<NutritionDiaryOverview />} />
                    </Routes>
                </MemoryRouter>
            </QueryClientProvider>
        );

        // Assert

        // Note that we currently can't check for other values as they are output with
        // a translation tag (nutrition.valueUnitG) and that is the only thing that is
        // shown in the tests

        expect(useFetchNutritionalPlanDateQuery).toHaveBeenCalled();
        expect(screen.getByText('1.7.2023')).toBeInTheDocument();

        expect(screen.getByRole('cell', { name: /0% fat Greek style yogurt/i })).toBeInTheDocument();
        expect(screen.getByText(/120g/i)).toBeInTheDocument();

        expect(screen.getByRole('cell', { name: /1001 nacht haferbrei/i })).toBeInTheDocument();
        expect(screen.getByText(/50g/)).toBeInTheDocument();

        expect(screen.getByRole('cell', { name: /100% boosted juice smoothie/i })).toBeInTheDocument();
        expect(screen.getByText(/200g/)).toBeInTheDocument();
    });
});
