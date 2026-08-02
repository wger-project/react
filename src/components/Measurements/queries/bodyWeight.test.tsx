import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from '@testing-library/react';
import { getBodyWeightCategory, getWeights } from "@/components/Measurements/api/bodyWeight";
import { useBodyWeightQuery } from "@/components/Measurements/queries/bodyWeight";
import { QueryKey } from "@/core/lib/consts";
import { testBodyWeightCategory } from "@/tests/weight/testData";
import React from "react";
import type { Mock } from 'vitest';

vi.mock("@/components/Measurements/api/bodyWeight");

describe("body weight queries", () => {

    beforeEach(() => {
        vi.clearAllMocks();
        (getBodyWeightCategory as Mock).mockResolvedValue(testBodyWeightCategory);
        (getWeights as Mock).mockResolvedValue([]);
    });

    test('an entry written anywhere invalidates the body weight view', async () => {

        const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
        const wrapper = ({ children }: { children: React.ReactNode }) =>
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;

        const { result } = renderHook(() => useBodyWeightQuery(), { wrapper });
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(getWeights).toHaveBeenCalledTimes(1);

        // What the measurement entry mutations invalidate. Body weight rows are
        // measurement rows, so this view has to follow
        await queryClient.invalidateQueries({ queryKey: [QueryKey.MEASUREMENTS] });

        await waitFor(() => expect(getWeights).toHaveBeenCalledTimes(2));
    });
});
