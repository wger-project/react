import {
    addSession,
    editSession,
    getSessions,
    searchSession,
    SessionQueryOptions
} from "@/components/Routines/api/session";
import { AddSessionParams, EditSessionParams } from "@/components/Routines/models/WorkoutSession";
import { QueryKey, } from "@/core/lib/consts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useFindSessionQuery = (routineId: number, queryParams: Record<string, any>) => useQuery({
    queryFn: () => searchSession(queryParams),
    queryKey: [QueryKey.SESSION_SEARCH, routineId, JSON.stringify(queryParams)],
});

export const useAddSessionQuery = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: AddSessionParams) => addSession(data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [QueryKey.ROUTINE_OVERVIEW] }),
    });
};

export const useSessionsQuery = (options?: SessionQueryOptions) => useQuery({
    queryFn: () => getSessions(options),
    queryKey: [QueryKey.SESSIONS_FULL, JSON.stringify(options || {})],
});


export const useEditSessionQuery = (id: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: EditSessionParams) => editSession(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QueryKey.ROUTINE_OVERVIEW] });
            queryClient.invalidateQueries({ queryKey: [QueryKey.ROUTINE_DETAIL, id] });
        }
    });
};


