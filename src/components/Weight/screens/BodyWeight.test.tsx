import { QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { getBodyWeightCategory, getWeights } from "@/components/Weight/api/weight";
import { testQueryClient } from "@/tests/queryClient";
import { testBodyWeightCategory, makeWeightEntry } from "@/tests/weight/testData";
import { BodyWeight } from "./BodyWeight";
import { FilterType } from "../widgets/FilterButtons";
import type { Mock } from 'vitest';

vi.mock("@/components/Weight/api/weight");
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
        expect(getWeights).toHaveBeenCalledWith(testBodyWeightCategory, 'lastYear');
    });

    test('changes filter and updates displayed data', async () => {

        // Mock the getWeights response based on the filter
        (getWeights as Mock).mockImplementation((categoryId: string, filter: FilterType) => {
            if (filter === 'lastYear') {
                return Promise.resolve(weightData);
            } else if (filter === 'lastMonth') {
                return Promise.resolve([]);
            }
            return Promise.resolve([]);
        });

        render(
            <QueryClientProvider client={testQueryClient}>
                <BodyWeight />
            </QueryClientProvider>
        );

        // Initially should display data for last year
        expect(await screen.findByText("80")).toBeInTheDocument();
        expect(await screen.findByText("90")).toBeInTheDocument();

        // Change filter to 'lastMonth'
        const filterButton = screen.getByRole('button', { name: /lastMonth/i });
        fireEvent.click(filterButton);

        // Expect getWeights to be called with 'lastMonth'
        await waitFor(() => {
            expect(getWeights).toHaveBeenCalledWith(testBodyWeightCategory, 'lastMonth');
        });

        // Check that entries for last year are no longer in the document
        expect(screen.queryByText("80")).not.toBeInTheDocument();
        expect(screen.queryByText("90")).not.toBeInTheDocument();
    });
});
