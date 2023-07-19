import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from '@testing-library/react';
import { PlanDetail } from "components/Nutrition/components/PlanDetail";
import { useFetchNutritionalPlanQuery } from "components/Nutrition/queries";
import { MemoryRouter, Route, Routes } from "react-router";
import { TEST_NUTRITIONAL_PLAN_2 } from "tests/nutritionTestdata";

jest.mock("components/Nutrition/queries");

const { ResizeObserver } = window;
const queryClient = new QueryClient();

describe("Test the PlanDetail component", () => {

    beforeEach(() => {
        // @ts-ignore
        useFetchNutritionalPlanQuery.mockImplementation(() => ({
            isSuccess: true,
            data: TEST_NUTRITIONAL_PLAN_2
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
