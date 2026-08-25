import { addSession, editSession, getSessions, searchSessions } from "@/components/Routines/api/session";
import {
    useAddSessionQuery,
    useEditSessionQuery,
    useFindSessionsQuery,
    useSessionOfDay,
    useSessionsQuery
} from "@/components/Routines/queries";
import { testWorkoutSession } from "@/tests/workoutLogsRoutinesTestData";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DateTime } from "luxon";
import { WorkoutSession } from "@/components/Routines/models/WorkoutSession";
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
        (searchSessions as Mock).mockResolvedValue([]);
        (getSessions as Mock).mockResolvedValue([]);
        (addSession as Mock).mockResolvedValue(testWorkoutSession);
        (editSession as Mock).mockResolvedValue(testWorkoutSession);
    });

    describe('useSessionOfDay', () => {

        const wrapper = () => {
            const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
            return ({ children }: { children: React.ReactNode }) =>
                <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
        };

        const sessionOn = (id: string, hour: number) => new WorkoutSession({
            id: id,
            dayId: 5,
            routineId: 1,
            notes: null,
            impression: '2',
            datetimeStart: DateTime.fromISO(`2024-05-01T${hour}:00`).toJSDate(),
            datetimeEnd: null,
        });

        test('asks for the day as a date filter', async () => {
            (searchSessions as Mock).mockResolvedValue([]);

            const { result } = renderHook(
                () => useSessionOfDay(1, 5, DateTime.fromISO('2024-05-01T18:30'), null),
                { wrapper: wrapper() }
            );

            // The server cuts the date filter in the profile timezone, the
            // same zone the streaks and the calendar count their days in
            await waitFor(() => expect(result.current.isSuccess).toBe(true));
            expect(searchSessions).toHaveBeenCalledWith({
                routine: 1,
                day: 5,
                datetime_start__date: '2024-05-01',
            });
        });

        test('takes the only session of the day without being asked', async () => {
            const session = sessionOn('bbbbbbbb-bbbb-bbbb-bbbb-000000000001', 8);
            (searchSessions as Mock).mockResolvedValue([session]);

            const { result } = renderHook(
                () => useSessionOfDay(1, 5, DateTime.fromISO('2024-05-01'), null),
                { wrapper: wrapper() }
            );

            await waitFor(() => expect(result.current.session).toEqual(session));
        });

        test('waits for a pick when the day holds several', async () => {
            const morning = sessionOn('bbbbbbbb-bbbb-bbbb-bbbb-000000000001', 8);
            const evening = sessionOn('bbbbbbbb-bbbb-bbbb-bbbb-000000000002', 18);
            (searchSessions as Mock).mockResolvedValue([morning, evening]);

            const { result, rerender } = renderHook(
                ({ chosenId }: { chosenId: string | null }) =>
                    useSessionOfDay(1, 5, DateTime.fromISO('2024-05-01'), chosenId),
                { wrapper: wrapper(), initialProps: { chosenId: null as string | null } }
            );

            await waitFor(() => expect(result.current.sessions).toHaveLength(2));
            expect(result.current.session).toBeUndefined();

            rerender({ chosenId: evening.id });
            expect(result.current.session).toEqual(evening);
        });
    });

    // The session form looks up the day it is editing; a search still
    // answering "none" after a write is what makes it save a second session
    test.each(sessionMutations)('a session %s invalidates the session search', async (_name, useWrite) => {

        const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
        const wrapper = ({ children }: { children: React.ReactNode }) =>
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;

        const { result } = renderHook(
            () => ({
                search: useFindSessionsQuery(testWorkoutSession.routineId, { day: testWorkoutSession.dayId }),
                write: useWrite(),
            }),
            { wrapper }
        );
        await waitFor(() => expect(result.current.search.isSuccess).toBe(true));
        expect(searchSessions).toHaveBeenCalledTimes(1);

        act(() => result.current.write());

        await waitFor(() => expect(searchSessions).toHaveBeenCalledTimes(2));
    });

    // The calendar renders the full list; a write must not leave it showing
    // the pre-write state until the staleTime runs out
    test.each(sessionMutations)('a session %s refreshes the full session list', async (_name, useWrite) => {

        const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
        const wrapper = ({ children }: { children: React.ReactNode }) =>
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;

        const { result } = renderHook(
            () => ({
                sessions: useSessionsQuery(),
                write: useWrite(),
            }),
            { wrapper }
        );
        await waitFor(() => expect(result.current.sessions.isSuccess).toBe(true));
        expect(getSessions).toHaveBeenCalledTimes(1);

        act(() => result.current.write());

        await waitFor(() => expect(getSessions).toHaveBeenCalledTimes(2));
    });
});
