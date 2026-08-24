import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from '@testing-library/react';
import {
    addMeasurementCategory,
    deleteMeasurementCategory,
    editMeasurementCategory,
    getMeasurementEntries
} from "@/components/Measurements/api/measurements";
import type { Mock } from 'vitest';
import {
    useAddMeasurementCategoryQuery,
    useDeleteMeasurementCategoryQuery,
    useEditMeasurementCategoryQuery,
    useMeasurementEntriesQuery
} from "@/components/Measurements/queries";
import { MeasurementCategory } from "@/components/Measurements/models/Category";
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
