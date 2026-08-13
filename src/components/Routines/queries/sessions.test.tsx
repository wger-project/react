import { addSession, editSession, searchSession } from "@/components/Routines/api/session";
import {
    useAddSessionQuery,
    useEditSessionQuery,
    useFindSessionQuery
} from "@/components/Routines/queries";
import { testWorkoutSession } from "@/tests/workoutLogsRoutinesTestData";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from '@testing-library/react';
import React from "react";
import type { Mock } from 'vitest';

vi.mock("@/components/Routines/api/session");

/** Each session mutation, wrapped in the call that writes one */
const sessionMutations: [string, () => () => void][] = [
    ['added', () => {
        const mutation = useAddSessionQuery();
        return () => mutation.mutate(testWorkoutSession);
    }],
    ['edited', () => {
        const mutation = useEditSessionQuery();
        return () => mutation.mutate(testWorkoutSession);
    }],
];

describe("session queries", () => {

    beforeEach(() => {
        vi.clearAllMocks();
        (searchSession as Mock).mockResolvedValue(null);
        (addSession as Mock).mockResolvedValue(testWorkoutSession);
        (editSession as Mock).mockResolvedValue(testWorkoutSession);
    });

    // The session form looks up the day it is editing; a search still
    // answering "none" after a write is what makes it save a second session
    test.each(sessionMutations)('a session %s invalidates the session search', async (_name, useWrite) => {

        const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
        const wrapper = ({ children }: { children: React.ReactNode }) =>
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;

        const { result } = renderHook(
            () => ({
                search: useFindSessionQuery(testWorkoutSession.routineId, { day: testWorkoutSession.dayId }),
                write: useWrite(),
            }),
            { wrapper }
        );
        await waitFor(() => expect(result.current.search.isSuccess).toBe(true));
        expect(searchSession).toHaveBeenCalledTimes(1);

        act(() => result.current.write());

        await waitFor(() => expect(searchSession).toHaveBeenCalledTimes(2));
    });
});
