import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from '@testing-library/react';
import {
    addMeasurementCategory,
    addMeasurementEntry,
    deleteMeasurementCategory,
    editMeasurementCategory,
    getCategoryEntryFlags,
    getMeasurementEntries
} from "@/components/Measurements/api/measurements";
import type { Mock } from 'vitest';
import {
    useAddMeasurementCategoryQuery,
    useAddMeasurementEntryQuery,
    useCategoryEntryFlagsQuery,
    useDeleteMeasurementCategoryQuery,
    useEditMeasurementCategoryQuery,
    useMeasurementEntriesQuery
} from "@/components/Measurements/queries";
import { MeasurementCategory } from "@/components/Measurements/models/Category";
import { MeasurementEntry } from "@/components/Measurements/models/Entry";
import React from 'react';

vi.mock("@/components/Measurements/api/measurements");

const CATEGORY_UUID = 'cccccccc-cccc-cccc-cccc-000000000001';
const category = new MeasurementCategory(CATEGORY_UUID, 'BMI', 'kg/m²', 'custom');

const categoryMutations: [string, () => () => void][] = [
    ['add', () => {
        const mutation = useAddMeasurementCategoryQuery();
        return () => mutation.mutate(category);
    }],
    ['edit', () => {
        const mutation = useEditMeasurementCategoryQuery(CATEGORY_UUID);
        return () => mutation.mutate(category);
    }],
    ['delete', () => {
        const mutation = useDeleteMeasurementCategoryQuery(CATEGORY_UUID);
        return () => mutation.mutate(CATEGORY_UUID);
    }],
];

describe('entry flags', () => {
    const makeWrapper = () => {
        const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
        return ({ children }: { children: React.ReactNode }) =>
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (getCategoryEntryFlags as Mock).mockResolvedValue([]);
        (addMeasurementEntry as Mock).mockResolvedValue(
            new MeasurementEntry(null, CATEGORY_UUID, new Date(), 42, '', 'user', {})
        );
    });

    test('the flags are fetched once, not again per remount or focus', async () => {
        // One request per category hides behind this read
        const wrapper = makeWrapper();

        const first = renderHook(() => useCategoryEntryFlagsQuery(), { wrapper });
        await waitFor(() => expect(first.result.current.isSuccess).toBe(true));
        first.unmount();

        const second = renderHook(() => useCategoryEntryFlagsQuery(), { wrapper });
        await waitFor(() => expect(second.result.current.isSuccess).toBe(true));

        expect(getCategoryEntryFlags).toHaveBeenCalledTimes(1);
    });

    test('an entry write still refreshes the flags', async () => {
        const wrapper = makeWrapper();

        const { result } = renderHook(
            () => ({
                flags: useCategoryEntryFlagsQuery(),
                write: useAddMeasurementEntryQuery(),
            }),
            { wrapper }
        );
        await waitFor(() => expect(result.current.flags.isSuccess).toBe(true));
        expect(getCategoryEntryFlags).toHaveBeenCalledTimes(1);

        act(() => result.current.write.mutate(
            new MeasurementEntry(null, CATEGORY_UUID, new Date(), 42, '', 'user', {})
        ));

        await waitFor(() => expect(getCategoryEntryFlags).toHaveBeenCalledTimes(2));
    });
});

describe('category mutations', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        (getMeasurementEntries as Mock).mockResolvedValue([]);
        (addMeasurementCategory as Mock).mockResolvedValue(category);
        (editMeasurementCategory as Mock).mockResolvedValue(category);
        (deleteMeasurementCategory as Mock).mockResolvedValue(undefined);
    });

    // The server materializes, rewrites or removes the entries of a
    // calculated category together with the category itself, so a stale
    // entry read shows a table that disagrees with the chart above it
    test.each(categoryMutations)('a category %s refreshes the entry reads', async (_name, useWrite) => {
        const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
        const wrapper = ({ children }: { children: React.ReactNode }) =>
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;

        const { result } = renderHook(
            () => ({
                entries: useMeasurementEntriesQuery(CATEGORY_UUID),
                write: useWrite(),
            }),
            { wrapper }
        );
        await waitFor(() => expect(result.current.entries.isSuccess).toBe(true));
        expect(getMeasurementEntries).toHaveBeenCalledTimes(1);

        act(() => result.current.write());

        await waitFor(() => expect(getMeasurementEntries).toHaveBeenCalledTimes(2));
    });
});
