import { getWorkoutLogs, editLog } from "@/components/Routines/api/workoutLogs";
import { useExerciseAnalyticsQuery } from "@/components/Routines/queries/analytics";
import { useEditRoutineLogQuery } from "@/components/Routines/queries/logs";
import { QueryKey } from "@/core/lib/consts";
import { analyticsLog } from "@/tests/analyticsTestData";
import { getTestQueryClient } from "@/tests/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from '@testing-library/react';
import React from "react";

vi.mock('@/components/Routines/api/workoutLogs');

beforeEach(() => vi.clearAllMocks());

test('switching ranges fetches distinct histories instead of reusing an unrelated cache entry', async () => {
    const client = getTestQueryClient();
    const wrapper = ({ children }: { children: React.ReactNode }) =>
        <QueryClientProvider client={client}>{children}</QueryClientProvider>;
    vi.mocked(getWorkoutLogs).mockResolvedValueOnce([analyticsLog()]).mockResolvedValueOnce([]);
    const { result, rerender } = renderHook(({ start }) => useExerciseAnalyticsQuery(
        start ? { date__gte: start } : {},
    ), { wrapper, initialProps: { start: '' } });
    await waitFor(() => expect(result.current.data).toHaveLength(1));

    rerender({ start: '2026-07-01T00:00:00Z' });
    await waitFor(() => expect(result.current.data).toEqual([]));
    expect(getWorkoutLogs).toHaveBeenLastCalledWith({
        loadExercises: true, filtersetQuery: { date__gte: '2026-07-01T00:00:00Z' },
    });
    expect(client.getQueryData([QueryKey.EXERCISE_ANALYTICS, {}])).toHaveLength(1);
});

test('editing a log invalidates every cached analytics range', async () => {
    const client = getTestQueryClient();
    const keys = [[QueryKey.EXERCISE_ANALYTICS, {}], [QueryKey.EXERCISE_ANALYTICS, { date__gte: '2026-06-01' }]];
    keys.forEach(key => client.setQueryData(key, [analyticsLog()]));
    vi.mocked(editLog).mockResolvedValue(analyticsLog({ weight: 60 }));
    const { result } = renderHook(() => useEditRoutineLogQuery(1), {
        wrapper: ({ children }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>,
    });
    await act(() => result.current.mutateAsync(analyticsLog({ weight: 60 })));
    keys.forEach(key => expect(client.getQueryState(key)?.isInvalidated).toBe(true));
});
