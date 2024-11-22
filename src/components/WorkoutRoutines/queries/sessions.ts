import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AddSessionParams, EditSessionParams } from "components/WorkoutRoutines/models/WorkoutSession";
import { addSession, editSession, searchSession } from "services";
import { QueryKey, } from "utils/consts";


export const useFindSessionQuery = (data: { routineId: number, date: string }) => useQuery({
    queryFn: () => searchSession(data),
    queryKey: [QueryKey.ROUTINES_ACTIVE, data.routineId, data.date],
});

export const useAddSessionQuery = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: AddSessionParams) => addSession(data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [QueryKey.ROUTINE_OVERVIEW] }),
    });
};


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


