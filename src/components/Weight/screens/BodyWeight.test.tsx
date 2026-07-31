import { QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { getBodyWeightCategory, getWeights } from "@/components/Weight/api/weight";
import { testQueryClient } from "@/tests/queryClient";
import { testBodyWeightCategory, makeWeightEntry } from "@/tests/weight/testData";
import { BodyWeight } from "./BodyWeight";
import type { Mock } from 'vitest';

vi.mock("@/components/Weight/api/weight");
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

        // Assert - both weights are found in the document
        expect(await screen.findByText("80")).toBeInTheDocument();
        expect(await screen.findByText("90")).toBeInTheDocument();
        // every entry is fetched, the range is cut client-side
        expect(getWeights).toHaveBeenCalledWith(testBodyWeightCategory, '');
    });

    test('picking a chart range does not refetch, and keeps every entry listed', async () => {

        (getWeights as Mock).mockImplementation(() => Promise.resolve(weightData));

        render(
            <QueryClientProvider client={testQueryClient}>
                <BodyWeight />
            </QueryClientProvider>
        );

        expect(await screen.findByText("80")).toBeInTheDocument();
        const fetches = (getWeights as Mock).mock.calls.length;

        fireEvent.click(screen.getByRole('button', { name: 'measurements.chartRangeAll' }));

        // the range only decides how far back the chart goes: the entries are
        // already there, and the table lists them whatever the range is
        await waitFor(() => {
            expect(screen.getByText("80")).toBeInTheDocument();
        });
        expect((getWeights as Mock).mock.calls.length).toBe(fetches);
    });
});
