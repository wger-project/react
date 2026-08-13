import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from '@testing-library/react';
import { getBodyWeightCategory, getWeights } from "@/components/Measurements/api/bodyWeight";
import {
    addMeasurementEntry,
    deleteMeasurementEntry,
    editMeasurementEntry
} from "@/components/Measurements/api/measurements";
import {
    useAddMeasurementEntryQuery,
    useDeleteMeasurementEntryQuery,
    useEditMeasurementEntryQuery
} from "@/components/Measurements/queries";
import { useBodyWeightQuery } from "@/components/Measurements/queries/bodyWeight";
import { testBodyWeightCategory, testWeightEntry1 } from "@/tests/weight/testData";
import React from "react";
import type { Mock } from 'vitest';

vi.mock("@/components/Measurements/api/bodyWeight");
vi.mock("@/components/Measurements/api/measurements");

/** Each entry mutation, wrapped in the call that writes a body weight row */
const entryMutations: [string, () => () => void][] = [
    ['added', () => {
        const mutation = useAddMeasurementEntryQuery();
        return () => mutation.mutate(testWeightEntry1);
    }],
    ['edited', () => {
        const mutation = useEditMeasurementEntryQuery();
        return () => mutation.mutate(testWeightEntry1);
    }],
    ['deleted', () => {
        const mutation = useDeleteMeasurementEntryQuery();
        return () => mutation.mutate(testWeightEntry1.id!);
    }],
];

describe("body weight queries", () => {

    beforeEach(() => {
        vi.clearAllMocks();
        (getBodyWeightCategory as Mock).mockResolvedValue(testBodyWeightCategory);
        (getWeights as Mock).mockResolvedValue([]);
        (addMeasurementEntry as Mock).mockResolvedValue(testWeightEntry1);
        (editMeasurementEntry as Mock).mockResolvedValue(testWeightEntry1);
        (deleteMeasurementEntry as Mock).mockResolvedValue(undefined);
    });

    // Body weight rows are measurement rows, so a write through the measurement
    // mutations has to refresh the weight view as well
    test.each(entryMutations)('an entry %s invalidates the body weight view', async (_name, useWrite) => {

        const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
        const wrapper = ({ children }: { children: React.ReactNode }) =>
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;

        const { result } = renderHook(
            () => ({ weights: useBodyWeightQuery(), write: useWrite() }),
            { wrapper }
        );
        await waitFor(() => expect(result.current.weights.isSuccess).toBe(true));
        expect(getWeights).toHaveBeenCalledTimes(1);

        act(() => result.current.write());

        await waitFor(() => expect(getWeights).toHaveBeenCalledTimes(2));
    });
});
