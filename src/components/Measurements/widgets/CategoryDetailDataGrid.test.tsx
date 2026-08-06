import { MeasurementCategory } from "@/components/Measurements/models/Category";
import { MeasurementEntry } from "@/components/Measurements/models/Entry";
import { useDeleteMeasurementEntryQuery, useEditMeasurementEntryQuery } from "@/components/Measurements/queries";
import { CategoryDetailDataGrid } from "@/components/Measurements/widgets/CategoryDetailDataGrid";
import { testQueryClient } from "@/tests/queryClient";
import { makeWeightEntry, testBodyWeightCategory } from "@/tests/weight/testData";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import React from 'react';
import type { Mock } from 'vitest';

vi.mock("@/components/Measurements/queries");

const CATEGORY_UUID = 'cccccccc-cccc-cccc-cccc-000000000001';
const USER_ENTRY_UUID = 'dddddddd-dddd-dddd-dddd-000000000001';
const SYNCED_ENTRY_UUID = 'dddddddd-dddd-dddd-dddd-000000000002';

describe('CategoryDetailDataGrid', () => {

    beforeEach(() => {
        (useEditMeasurementEntryQuery as Mock).mockImplementation(() => ({
            mutate: vi.fn(),
            mutateAsync: vi.fn().mockResolvedValue(undefined)
        }));
        (useDeleteMeasurementEntryQuery as Mock).mockImplementation(() => ({
            mutate: vi.fn(),
            mutateAsync: vi.fn().mockResolvedValue(undefined)
        }));
    });

    test('entries synced from a health app offer no edit or delete actions', async () => {
        const category = new MeasurementCategory(CATEGORY_UUID, 'Biceps', 'cm');
        const entries = [
            new MeasurementEntry(USER_ENTRY_UUID, CATEGORY_UUID, new Date(2023, 1, 1), 10, '', 'user'),
            new MeasurementEntry(SYNCED_ENTRY_UUID, CATEGORY_UUID, new Date(2023, 1, 2), 12, '', 'apple'),
        ];

        render(
            <QueryClientProvider client={testQueryClient}>
                <CategoryDetailDataGrid category={category} entries={entries} />
            </QueryClientProvider>
        );
        await screen.findByText('10');

        const userRow = document.querySelector(`[data-id="${USER_ENTRY_UUID}"]`) as HTMLElement;
        const syncedRow = document.querySelector(`[data-id="${SYNCED_ENTRY_UUID}"]`) as HTMLElement;

        expect(within(userRow).getByRole('menuitem', { name: /edit/i })).toBeInTheDocument();
        expect(within(userRow).getByRole('menuitem', { name: /delete/i })).toBeInTheDocument();

        expect(within(syncedRow).queryByRole('menuitem', { name: /edit/i })).not.toBeInTheDocument();
        expect(within(syncedRow).queryByRole('menuitem', { name: /delete/i })).not.toBeInTheDocument();
        expect(within(syncedRow).getByRole('menuitem', { name: 'syncedEntryInfo' })).toBeInTheDocument();
    });

    test('a duration reads h:mm, in the value and in the change columns', async () => {
        const category = new MeasurementCategory(CATEGORY_UUID, 'Total sleep', 'min');
        const entries = [
            new MeasurementEntry(USER_ENTRY_UUID, CATEGORY_UUID, new Date(2023, 1, 1), 480, '', 'user'),
            new MeasurementEntry(SYNCED_ENTRY_UUID, CATEGORY_UUID, new Date(2023, 1, 2), 437, '', 'apple'),
        ];

        render(
            <QueryClientProvider client={testQueryClient}>
                <CategoryDetailDataGrid category={category} entries={entries} />
            </QueryClientProvider>
        );
        await screen.findByText('8:00 h');

        const laterRow = document.querySelector(`[data-id="${SYNCED_ENTRY_UUID}"]`) as HTMLElement;
        const cell = (field: string) => laterRow.querySelector(`[data-field="${field}"]`)!.textContent;
        expect(cell('value')).toBe('7:17 h');
        expect(cell('change')).toBe('-0:43');
        expect(cell('totalChange')).toBe('-0:43');
    });

    /*
     * Body weight is the one category whose entries can be stored in a unit
     * other than the one they are shown in
     */
    describe('with a display unit', () => {

        const ENTRY_UUID_1 = 'dddddddd-dddd-dddd-dddd-000000000011';
        const ENTRY_UUID_2 = 'dddddddd-dddd-dddd-dddd-000000000012';

        const renderGrid = (entries: MeasurementEntry[]) => render(
            <QueryClientProvider client={testQueryClient}>
                <CategoryDetailDataGrid
                    category={testBodyWeightCategory}
                    entries={entries}
                    displayUnit="kg" />
            </QueryClientProvider>
        );

        // the grid formats numbers with the runner's locale, normalize the
        // decimal separator
        const cellText = (row: HTMLElement, field: string) =>
            row.querySelector(`[data-field="${field}"]`)!.textContent!.replace(',', '.');

        test('converts mixed units to the display unit, including the aggregations', async () => {
            // 90 lb = 40.82 kg, entered a day after the 80 kg entry
            renderGrid([
                makeWeightEntry(new Date('2021/12/10'), 80, { id: ENTRY_UUID_1, unit: 'kg' }),
                makeWeightEntry(new Date('2021/12/11'), 90, { id: ENTRY_UUID_2, unit: 'lb' }),
            ]);
            await screen.findByText('80 kg');

            const lbRow = document.querySelector(`[data-id="${ENTRY_UUID_2}"]`) as HTMLElement;
            expect(cellText(lbRow, 'value')).toBe('40.82 kg');
            // change and totalChange are computed on the converted values
            expect(cellText(lbRow, 'totalChange')).toBe('-39.18');
        });

        test('saving a row without editing the value keeps the stored value and unit', async () => {
            const user = userEvent.setup();
            const mutateEditMock = vi.fn();
            (useEditMeasurementEntryQuery as Mock).mockImplementation(() => ({
                mutate: mutateEditMock,
                mutateAsync: mutateEditMock
            }));
            // stored as 90 lb, displayed as 40.82 kg
            renderGrid([makeWeightEntry(new Date('2021/12/10'), 90, { id: ENTRY_UUID_1, unit: 'lb' })]);

            await screen.findByText(/40[.,]82/);
            await user.click(screen.getByRole('menuitem', { name: /edit/i }));
            await user.click(screen.getByRole('menuitem', { name: /save/i }));

            // the displayed conversion must not be written back to the entry
            expect(mutateEditMock).toHaveBeenCalled();
            const submitted = mutateEditMock.mock.calls[0][0] as MeasurementEntry;
            expect(Number(submitted.value)).toBe(90);
            expect(submitted.extraData.unit).toBe('lb');
        });

        test('editing the value cell stamps the display unit', async () => {
            const user = userEvent.setup();
            const mutateEditMock = vi.fn();
            (useEditMeasurementEntryQuery as Mock).mockImplementation(() => ({
                mutate: mutateEditMock,
                mutateAsync: mutateEditMock
            }));
            renderGrid([makeWeightEntry(new Date('2021/12/10'), 90, { id: ENTRY_UUID_1, unit: 'lb' })]);

            await screen.findByText(/40[.,]82/);
            await user.click(screen.getByRole('menuitem', { name: /edit/i }));

            // the typed value is in the unit the grid shows, not the one the
            // entry was stored in
            const valueInput = screen.getByRole('spinbutton');
            await user.clear(valueInput);
            await user.type(valueInput, '41');
            await user.click(screen.getByRole('menuitem', { name: /save/i }));

            expect(mutateEditMock).toHaveBeenCalled();
            const submitted = mutateEditMock.mock.calls[0][0] as MeasurementEntry;
            expect(Number(submitted.value)).toBe(41);
            expect(submitted.extraData.unit).toBe('kg');
        });

        test('implausible inline edits are rejected and the row stays editable', async () => {
            const user = userEvent.setup();
            const mutateEditMock = vi.fn();
            (useEditMeasurementEntryQuery as Mock).mockImplementation(() => ({
                mutate: mutateEditMock,
                mutateAsync: mutateEditMock
            }));
            renderGrid([makeWeightEntry(new Date('2021/12/10'), 80, { id: ENTRY_UUID_1, unit: 'kg' })]);

            await screen.findByText('80 kg');
            await user.click(screen.getByRole('menuitem', { name: /edit/i }));

            const valueInput = screen.getByRole('spinbutton');
            await user.clear(valueInput);
            await user.type(valueInput, '5000');
            await user.click(screen.getByRole('menuitem', { name: /save/i }));

            // nothing is saved, the error shows up and the cell stays editable
            expect(mutateEditMock).not.toHaveBeenCalled();
            expect(await screen.findByText('forms.maxValue')).toBeInTheDocument();
            expect(screen.getByRole('spinbutton')).toBeInTheDocument();

            // correcting the value saves normally
            await user.clear(valueInput);
            await user.type(valueInput, '90');
            await user.click(screen.getByRole('menuitem', { name: /save/i }));
            expect(mutateEditMock).toHaveBeenCalled();
            const submitted = mutateEditMock.mock.calls[0][0] as MeasurementEntry;
            expect(Number(submitted.value)).toBe(90);
        });

        test('an edit the server refuses is shown instead of being kept', async () => {
            const user = userEvent.setup();
            const mutateEditMock = vi.fn().mockRejectedValue({
                response: { data: { value: ['Value must be between 20 and 350'] } },
            });
            (useEditMeasurementEntryQuery as Mock).mockImplementation(
                () => ({ mutate: vi.fn(), mutateAsync: mutateEditMock })
            );
            renderGrid([makeWeightEntry(new Date('2021/12/10'), 80, { id: ENTRY_UUID_1, unit: 'kg' })]);

            await screen.findByText('80 kg');
            await user.click(screen.getByRole('menuitem', { name: /edit/i }));

            const valueInput = screen.getByRole('spinbutton');
            await user.clear(valueInput);
            await user.type(valueInput, '90');
            await user.click(screen.getByRole('menuitem', { name: /save/i }));

            expect(mutateEditMock).toHaveBeenCalled();
            expect(
                await screen.findByText('value: Value must be between 20 and 350')
            ).toBeInTheDocument();
        });
    });
});
