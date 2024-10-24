import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addDay, deleteDay, editDay } from "services";
import { AddDayParams, EditDayParams } from "services/day";
import { QueryKey, } from "utils/consts";


export const useEditDayQuery = (routineId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: EditDayParams) => editDay(data),
        onSuccess: () => queryClient.invalidateQueries([QueryKey.ROUTINE_DETAIL, routineId])
    });
};

export const useAddDayQuery = (routineId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: AddDayParams) => addDay(data),
        onSuccess: () => queryClient.invalidateQueries([QueryKey.ROUTINE_DETAIL, routineId])
    });
};


export const useDeleteDayQuery = (routineId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => deleteDay(id),
        onSuccess: () => queryClient.invalidateQueries([QueryKey.ROUTINE_DETAIL, routineId])
    });
};
