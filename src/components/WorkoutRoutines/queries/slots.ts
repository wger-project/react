import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addSlot, deleteSlot, editSlot } from "services";
import { AddSlotParams, EditSlotParams } from "services/slot";
import { QueryKey, } from "utils/consts";


export const useAddSlotQuery = (routineId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: AddSlotParams) => addSlot(data),
        onSuccess: () => queryClient.invalidateQueries([QueryKey.ROUTINE_DETAIL, routineId])
    });
};

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
