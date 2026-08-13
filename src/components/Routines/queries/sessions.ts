import {
    addSession,
    editSession,
    getSessions,
    searchSession,
    SessionQueryOptions
} from "@/components/Routines/api/session";
import { WorkoutSession } from "@/components/Routines/models/WorkoutSession";
import { QueryKey, } from "@/core/lib/consts";
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
export const useFindSessionQuery = (routineId: number, queryParams: Record<string, any>) => useQuery({
    queryFn: () => searchSession(queryParams),
    queryKey: [QueryKey.SESSION_SEARCH, routineId, queryParams],
});

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


