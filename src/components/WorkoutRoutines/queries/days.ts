import { useMutation, useQueryClient } from "@tanstack/react-query";
import { editDay, EditDayParams } from "services/day";
import { QueryKey, } from "utils/consts";


export const useEditDayQuery = (routineId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: EditDayParams) => editDay(data),
        onSuccess: () => queryClient.invalidateQueries([QueryKey.ROUTINE_DETAIL, routineId])
    });
};
