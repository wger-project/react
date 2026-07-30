import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import { WeightEntry } from "@/components/Weight/models/WeightEntry";
import { useDeleteWeightEntryQuery, useEditWeightEntryQuery } from "@/components/Weight/queries";
import { BrowserRouter } from "react-router-dom";
import { testQueryClient } from "@/tests/queryClient";
import type { Mock } from 'vitest';
import { WeightTable } from './index';

vi.mock("@/components/Weight/queries");

const renderTable = (weights: WeightEntry[]) =>
    render(
        <BrowserRouter>
            <QueryClientProvider client={testQueryClient}>
                <WeightTable weights={weights} unit="kg" />
            </QueryClientProvider>
        </BrowserRouter>
    );

const ENTRY_UUID_1 = 'dddddddd-dddd-dddd-dddd-000000000001';
const ENTRY_UUID_2 = 'dddddddd-dddd-dddd-dddd-000000000002';
const ENTRY_UUID_3 = 'dddddddd-dddd-dddd-dddd-000000000003';

describe("Body weight table", () => {

    beforeEach(() => {
        (useEditWeightEntryQuery as Mock).mockImplementation(() => ({ mutate: vi.fn() }));
        (useDeleteWeightEntryQuery as Mock).mockImplementation(() => ({ mutate: vi.fn() }));
    });

    test('renders rows for all weight entries', async () => {
        const weights: WeightEntry[] = [
            new WeightEntry(new Date('2021/12/10'), 80, ENTRY_UUID_1),
            new WeightEntry(new Date('2021/12/20'), 90, ENTRY_UUID_2),
        ];

        renderTable(weights);

        expect(await screen.findByText('80')).toBeInTheDocument();
        expect(await screen.findByText('90')).toBeInTheDocument();
    });

    test('displays total change column correctly', async () => {
        const weights: WeightEntry[] = [
            new WeightEntry(new Date('2021/12/10'), 80, ENTRY_UUID_1),
            new WeightEntry(new Date('2021/12/20'), 90, ENTRY_UUID_2),
            new WeightEntry(new Date('2021/12/25'), 85, ENTRY_UUID_3),
        ];

        renderTable(weights);
        await screen.findByText('80');

        // DataGrid rows are sorted newest-first: 85 (total +5), 90 (+10), 80 (0)
        const rowIds: Record<string, string> = { '80': ENTRY_UUID_1, '90': ENTRY_UUID_2, '85': ENTRY_UUID_3 };
        const expectedTotals: Record<string, string> = { '85': '5', '90': '10', '80': '0' };

        for (const [weight, totalChange] of Object.entries(expectedTotals)) {
            const row = document.querySelector(`[data-id="${rowIds[weight]}"]`) as HTMLElement;
            expect(row).not.toBeNull();
            const cell = row.querySelector('[data-field="totalChange"]') as HTMLElement;
            expect(cell.textContent).toBe(totalChange);
        }
    });

    test('shows inline edit and delete actions per row', async () => {
        const weights: WeightEntry[] = [new WeightEntry(new Date('2021/12/10'), 80, ENTRY_UUID_1)];
        renderTable(weights);

        await screen.findByText('80');
        expect(screen.getByRole('menuitem', { name: /edit/i })).toBeInTheDocument();
        expect(screen.getByRole('menuitem', { name: /delete/i })).toBeInTheDocument();
    });

    test('converts mixed units to the display unit, including aggregations', async () => {
        // 90 lb = 40.82 kg, entered a day after the 80 kg entry
        const weights: WeightEntry[] = [
            new WeightEntry(new Date('2021/12/10'), 80, ENTRY_UUID_1, '', 'kg'),
            new WeightEntry(new Date('2021/12/11'), 90, ENTRY_UUID_2, '', 'lb'),
        ];

        renderTable(weights);
        await screen.findByText('80');

        // the DataGrid formats numbers with the runner's locale, normalize the decimal separator
        const cellText = (row: HTMLElement, field: string) =>
            row.querySelector(`[data-field="${field}"]`)!.textContent!.replace(',', '.');

        const lbRow = document.querySelector(`[data-id="${ENTRY_UUID_2}"]`) as HTMLElement;
        expect(cellText(lbRow, 'weight')).toBe('40.82');
        // change and totalChange are computed on the converted values
        expect(cellText(lbRow, 'totalChange')).toBe('-39.18');
    });

    test('saving a row without editing the weight keeps the stored value and unit', async () => {
        const user = userEvent.setup();
        const mutateEditMock = vi.fn();
        (useEditWeightEntryQuery as Mock).mockImplementation(() => ({ mutate: mutateEditMock }));
        // stored as 90 lb, displayed as 40.82 kg
        const weights: WeightEntry[] = [
            new WeightEntry(new Date('2021/12/10'), 90, ENTRY_UUID_1, '', 'lb'),
        ];

        renderTable(weights);
        await screen.findByText(/40[.,]82/);
        await user.click(screen.getByRole('menuitem', { name: /edit/i }));
        await user.click(screen.getByRole('menuitem', { name: /save/i }));

        // the displayed conversion must not be written back to the entry
        expect(mutateEditMock).toHaveBeenCalled();
        const submitted = mutateEditMock.mock.calls[0][0] as WeightEntry;
        expect(Number(submitted.weight)).toBe(90);
        expect(submitted.unit).toBe('lb');
    });

    test('editing the weight cell stamps the display unit', async () => {
        const user = userEvent.setup();
        const mutateEditMock = vi.fn();
        (useEditWeightEntryQuery as Mock).mockImplementation(() => ({ mutate: mutateEditMock }));
        const weights: WeightEntry[] = [
            new WeightEntry(new Date('2021/12/10'), 90, ENTRY_UUID_1, '', 'lb'),
        ];

        renderTable(weights);
        await screen.findByText(/40[.,]82/);
        await user.click(screen.getByRole('menuitem', { name: /edit/i }));

        // the weight cell is a number input while the row is in edit mode;
        // the typed value is in the unit the column header shows (kg)
        const weightInput = screen.getByRole('spinbutton');
        await user.clear(weightInput);
        await user.type(weightInput, '41');
        await user.click(screen.getByRole('menuitem', { name: /save/i }));

        expect(mutateEditMock).toHaveBeenCalled();
        const submitted = mutateEditMock.mock.calls[0][0] as WeightEntry;
        expect(Number(submitted.weight)).toBe(41);
        expect(submitted.unit).toBe('kg');
    });

    test('entries synced from a health app offer no edit or delete actions', async () => {
        const weights: WeightEntry[] = [
            new WeightEntry(new Date('2021/12/10'), 80, ENTRY_UUID_1, '', 'kg', 'apple'),
        ];

        renderTable(weights);
        await screen.findByText('80');

        expect(screen.queryByRole('menuitem', { name: /edit/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('menuitem', { name: /delete/i })).not.toBeInTheDocument();
        expect(screen.getByRole('menuitem', { name: 'syncedEntryInfo' })).toBeInTheDocument();
    });
});
