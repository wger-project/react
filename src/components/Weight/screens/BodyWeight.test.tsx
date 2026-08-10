import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import { WeightEntry } from "@/components/Weight/models/WeightEntry";
import { getWeights } from "@/components/Weight/api/weight";
import { getTestQueryClient } from "@/tests/queryClient";
import { BodyWeight } from "./BodyWeight";
import { FilterType } from "../widgets/FilterButtons";
import type { Mock } from 'vitest';

vi.mock("@/components/Weight/api/weight");

describe("Test BodyWeight component", () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    // Arrange
    const weightData = [
        new WeightEntry(new Date('2021-12-10'), 80, 1),
        new WeightEntry(new Date('2021-12-20'), 90, 2),
    ];

    /*
     * Each test gets its own query client. With a shared one the cached entries of
     * the previous test would answer the query here, regardless of the mock.
     */
    const renderComponent = () => render(
        <QueryClientProvider client={getTestQueryClient()}>
            <BodyWeight />
        </QueryClientProvider>
    );

    test('renders without crashing', async () => {

        (getWeights as Mock).mockImplementation(() => Promise.resolve(weightData));

        // Act
        renderComponent();

        // Assert
        expect(getWeights).toHaveBeenCalledTimes(1);

        // Both weights are found in the document
        expect(await screen.findByText("80")).toBeInTheDocument();
        expect(await screen.findByText("90")).toBeInTheDocument();
    });

    test('changes filter and updates displayed data', async () => {

        // Arrange
        const user = userEvent.setup();

        // Mock the getWeights response based on the filter
        (getWeights as Mock).mockImplementation((filter: FilterType) => {
            if (filter === 'lastYear') {
                return Promise.resolve(weightData);
            }
            return Promise.resolve([]);
        });

        // Act
        renderComponent();

        // Assert - initially the data for last year is shown
        expect(await screen.findByText("80")).toBeInTheDocument();
        expect(await screen.findByText("90")).toBeInTheDocument();

        // Act - change the filter to 'lastMonth'
        await user.click(screen.getByRole('button', { name: /lastMonth/i }));

        // Assert - the empty result of the new filter replaces the old entries
        expect(getWeights).toHaveBeenCalledWith('lastMonth');
        await waitFor(() => expect(screen.getByText('nothingHereYet')).toBeInTheDocument());
        expect(screen.queryByText("80")).not.toBeInTheDocument();
        expect(screen.queryByText("90")).not.toBeInTheDocument();
    });

    test('shows the empty state when there are no entries at all', async () => {

        // Arrange
        (getWeights as Mock).mockImplementation(() => Promise.resolve([]));

        // Act
        renderComponent();

        // Assert
        expect(await screen.findByText('nothingHereYet')).toBeInTheDocument();
    });
});
