import {
    addSession,
    editSession,
    getSessions,
    searchSessions,
    SessionQueryOptions
} from "@/components/Routines/api/session";
import { WorkoutSession } from "@/components/Routines/models/WorkoutSession";
import { QueryKey, } from "@/core/lib/consts";
import { DateTime } from "luxon";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";


/**
 * What a written session ages: the routine it belongs to, and the search the
 * session form looks it up with. Without the latter the form would still be
 * told there is no session for that day and save a second one.
 */
const invalidateSessionReads = (
    queryClient: ReturnType<typeof useQueryClient>,
    session: WorkoutSession,
) => {
    queryClient.invalidateQueries({ queryKey: [QueryKey.ROUTINE_OVERVIEW] });
    queryClient.invalidateQueries({ queryKey: [QueryKey.ROUTINE_DETAIL, session.routineId] });
    queryClient.invalidateQueries({ queryKey: [QueryKey.SESSION_SEARCH] });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useFindSessionsQuery = (routineId: number, queryParams: Record<string, any>) => useQuery({
    queryFn: () => searchSessions(queryParams),
    queryKey: [QueryKey.SESSION_SEARCH, routineId, queryParams],
});

/*
 * The sessions logged on one day of a routine, and the one being worked on
 *
 * A single session is the one, several need the caller to pick one by id. The
 * day is read as the instants it spans in the browser's timezone: a date bound
 * would be cut in the server's, and a session logged shortly after midnight
 * would be looked for on the wrong day.
 */
export const useSessionOfDay = (routineId: number, dayId: number, date: DateTime, chosenId: string | null) => {
    const dayStart = date.startOf('day');
    const query = useFindSessionsQuery(routineId, {
        routine: routineId,
        // eslint-disable-next-line camelcase
        datetime_start__gte: dayStart.toJSDate().toISOString(),
        // eslint-disable-next-line camelcase
        datetime_start__lt: dayStart.plus({ days: 1 }).toJSDate().toISOString(),
        day: dayId,
    });

    const sessions = query.data ?? [];

    return {
        sessions: sessions,
        session: sessions.length === 1 ? sessions[0] : sessions.find(entry => entry.id === chosenId),
        isLoading: query.isLoading,
        isSuccess: query.isSuccess,
    };
};

export const useAddSessionQuery = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (session: WorkoutSession) => addSession(session),
        onSuccess: (session: WorkoutSession) => invalidateSessionReads(queryClient, session),
    });
};

export const useSessionsQuery = (options?: SessionQueryOptions) => useQuery({
    queryFn: () => getSessions(options),
    queryKey: [QueryKey.SESSIONS_FULL, options ?? {}],
});


export const useEditSessionQuery = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (session: WorkoutSession) => editSession(session),
        onSuccess: (session: WorkoutSession) => invalidateSessionReads(queryClient, session),
    });
};


