import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteSlotConfig, editSlotConfig } from "services";
import { addSlotConfig, AddSlotConfigParams, EditSlotConfigParams } from "services/slot_config";
import { QueryKey, } from "utils/consts";


export const useEditSlotConfigQuery = (routineId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: EditSlotConfigParams) => editSlotConfig(data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [QueryKey.ROUTINE_DETAIL, routineId] })
    });
};

export const useAddSlotConfigQuery = (routineId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: AddSlotConfigParams) => addSlotConfig(data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [QueryKey.ROUTINE_DETAIL, routineId] })
    });
};

export const useDeleteSlotConfigQuery = (routineId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (slotId: number) => deleteSlotConfig(slotId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [QueryKey.ROUTINE_DETAIL, routineId] })
    });
};
