import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Day } from "components/WorkoutRoutines/models/Day";
import { addDay, deleteDay, editDay, editDayOrder } from "services";
import { QueryKey, } from "utils/consts";


export const useEditDayQuery = (routineId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (day: Day) => editDay(day),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [QueryKey.ROUTINE_DETAIL, routineId] })
    });
};

export const useEditDayOrderQuery = (routineId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (days: Day[]) => editDayOrder(days),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [QueryKey.ROUTINE_DETAIL, routineId] })
    });
};

export const useAddDayQuery = (routineId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (day: Day) => addDay(day),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [QueryKey.ROUTINE_DETAIL, routineId] })
    });
};


export const useDeleteDayQuery = (routineId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => deleteDay(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [QueryKey.ROUTINE_DETAIL, routineId] })
    });
};
