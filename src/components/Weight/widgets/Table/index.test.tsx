import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from '@testing-library/react';
import { WeightEntry } from "@/components/Weight/models/WeightEntry";
import { BrowserRouter } from "react-router-dom";
import { testQueryClient } from "@/tests/queryClient";
import { WeightTable } from './index';

const renderTable = (weights: WeightEntry[]) =>
    render(
        <BrowserRouter>
            <QueryClientProvider client={testQueryClient}>
                <WeightTable weights={weights} />
            </QueryClientProvider>
        </BrowserRouter>
    );

describe("Body weight table", () => {
    test('renders rows for all weight entries', async () => {
        const weights: WeightEntry[] = [
            new WeightEntry(new Date('2021/12/10'), 80, 1),
            new WeightEntry(new Date('2021/12/20'), 90, 2),
        ];

        renderTable(weights);

        expect(await screen.findByText('80')).toBeInTheDocument();
        expect(await screen.findByText('90')).toBeInTheDocument();
    });

    test('displays total change column correctly', async () => {
        const weights: WeightEntry[] = [
            new WeightEntry(new Date('2021/12/10'), 80, 1),
            new WeightEntry(new Date('2021/12/20'), 90, 2),
            new WeightEntry(new Date('2021/12/25'), 85, 3),
        ];

        renderTable(weights);
        await screen.findByText('80');

        // DataGrid rows are sorted newest-first: 85 (total +5), 90 (+10), 80 (0)
        const expectedTotals: Record<string, string> = { '85': '5', '90': '10', '80': '0' };

        for (const [weight, totalChange] of Object.entries(expectedTotals)) {
            const row = document.querySelector(`[data-id="${weight === '80' ? 1 : weight === '90' ? 2 : 3}"]`) as HTMLElement;
            expect(row).not.toBeNull();
            const cell = row.querySelector('[data-field="totalChange"]') as HTMLElement;
            expect(cell.textContent).toBe(totalChange);
        }
    });

    test('shows inline edit and delete actions per row', async () => {
        const weights: WeightEntry[] = [new WeightEntry(new Date('2021/12/10'), 80, 1)];
        renderTable(weights);

        await screen.findByText('80');
        expect(screen.getByRole('menuitem', { name: /edit/i })).toBeInTheDocument();
        expect(screen.getByRole('menuitem', { name: /delete/i })).toBeInTheDocument();
    });
});
