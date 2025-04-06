import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AddSessionParams, EditSessionParams } from "components/WorkoutRoutines/models/WorkoutSession";
import { addSession, editSession, searchSession } from "services";
import { getSessions } from "services/session";
import { QueryKey, } from "utils/consts";


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

export const useSessionsQuery = () => useQuery({
    queryFn: () => getSessions(),
    queryKey: [QueryKey.SESSIONS_FULL],
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


