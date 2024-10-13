import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteSlot, editSlot, EditSlotParams } from "services/slot";
import { QueryKey, } from "utils/consts";


export const useEditSlotQuery = (routineId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: EditSlotParams) => editSlot(data),
        onSuccess: () => queryClient.invalidateQueries([QueryKey.ROUTINE_DETAIL, routineId])
    });
};

export const useDeleteSlotQuery = (routineId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (slotId: number) => deleteSlot(slotId),
        onSuccess: () => queryClient.invalidateQueries([QueryKey.ROUTINE_DETAIL, routineId])
    });
};
