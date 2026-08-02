import { QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { DEFAULT_CHART_RANGE, entryFilterFor } from "@/components/Measurements";
import { getBodyWeightCategory, getWeights } from "@/components/Measurements/api/bodyWeight";
import { testQueryClient } from "@/tests/queryClient";
import { testBodyWeightCategory, makeWeightEntry } from "@/tests/weight/testData";
import { BodyWeight } from "./BodyWeight";
import type { Mock } from 'vitest';

vi.mock("@/components/Measurements/api/bodyWeight");
vi.mock('@/components/Nutrition/queries/plan', () => ({
    useNutritionPlanPeriods: () => [],
}));
vi.mock('@/components/User/queries/profile', () => ({
    useProfileQuery: () => ({ isLoading: false, data: { useMetric: true } }),
}));
console.log = vi.fn();

describe("Test BodyWeight component", () => {

    beforeEach(() => {
        testQueryClient.clear();
        (getBodyWeightCategory as Mock).mockImplementation(() => Promise.resolve(testBodyWeightCategory));
    });

    // See https://github.com/maslianok/react-resize-detector#testing-with-enzyme-and-jest
    afterEach(() => {
        vi.restoreAllMocks();
    });

    // Arrange
    const weightData = [
        makeWeightEntry(new Date('2021-12-10'), 80, { id: 'dddddddd-dddd-dddd-dddd-000000000001' }),
        makeWeightEntry(new Date('2021-12-20'), 90, { id: 'dddddddd-dddd-dddd-dddd-000000000002' }),
    ];

    test('renders without crashing', async () => {

        (getWeights as Mock).mockImplementation(() => Promise.resolve(weightData));

        // Act
        render(
            <QueryClientProvider client={testQueryClient}>
                <BodyWeight />
            </QueryClientProvider>
        );

        // Assert - both weights are found in the document, in the unit the
        // grid shows them in
        expect(await screen.findByText("80 kg")).toBeInTheDocument();
        expect(await screen.findByText("90 kg")).toBeInTheDocument();
        // only the entries the range shows are fetched
        expect(getWeights).toHaveBeenCalledWith(
            testBodyWeightCategory,
            entryFilterFor(DEFAULT_CHART_RANGE),
        );
    });

    test('picking a chart range fetches that range', async () => {

        (getWeights as Mock).mockImplementation(() => Promise.resolve(weightData));

        render(
            <QueryClientProvider client={testQueryClient}>
                <BodyWeight />
            </QueryClientProvider>
        );

        expect(await screen.findByText("80 kg")).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'measurements.chartRangeAll' }));

        // the full history has no lower bound, so the filterset is empty
        await waitFor(() => {
            expect(getWeights).toHaveBeenLastCalledWith(testBodyWeightCategory, {});
        });
        // the entries stay on screen while the wider range is loading
        expect(screen.getByText("80 kg")).toBeInTheDocument();
    });
});
