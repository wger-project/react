import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from '@testing-library/react';
import { MeasurementCategory } from "@/components/Measurements/models/Category";
import { MeasurementEntry } from "@/components/Measurements/models/Entry";
import { useDeleteMeasurementEntryQuery, useEditMeasurementEntryQuery } from "@/components/Measurements/queries";
import { CategoryDetailDataGrid } from "@/components/Measurements/widgets/CategoryDetailDataGrid";
import React from 'react';
import { testQueryClient } from "@/tests/queryClient";
import type { Mock } from 'vitest';

vi.mock("@/components/Measurements/queries");

const CATEGORY_UUID = 'cccccccc-cccc-cccc-cccc-000000000001';
const USER_ENTRY_UUID = 'dddddddd-dddd-dddd-dddd-000000000001';
const SYNCED_ENTRY_UUID = 'dddddddd-dddd-dddd-dddd-000000000002';

describe('CategoryDetailDataGrid', () => {

    beforeEach(() => {
        (useEditMeasurementEntryQuery as Mock).mockImplementation(() => ({ mutate: vi.fn() }));
        (useDeleteMeasurementEntryQuery as Mock).mockImplementation(() => ({ mutate: vi.fn() }));
    });

    test('entries synced from a health app offer no edit or delete actions', async () => {
        const category = new MeasurementCategory(
            CATEGORY_UUID,
            'Biceps',
            'cm',
            [
                new MeasurementEntry(USER_ENTRY_UUID, CATEGORY_UUID, new Date(2023, 1, 1), 10, '', 'user'),
                new MeasurementEntry(SYNCED_ENTRY_UUID, CATEGORY_UUID, new Date(2023, 1, 2), 12, '', 'apple'),
            ],
        );

        render(
            <QueryClientProvider client={testQueryClient}>
                <CategoryDetailDataGrid category={category} />
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
});
