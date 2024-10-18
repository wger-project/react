import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteSlotConfig, editSlotConfig } from "services";
import { EditSlotConfigParams } from "services/slot_config";
import { QueryKey, } from "utils/consts";


export const useEditSlotConfigQuery = (routineId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: EditSlotConfigParams) => editSlotConfig(data),
        onSuccess: () => queryClient.invalidateQueries([QueryKey.ROUTINE_DETAIL, routineId])
    });
};

export const useDeleteSlotConfigQuery = (routineId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (slotId: number) => deleteSlotConfig(slotId),
        onSuccess: () => queryClient.invalidateQueries([QueryKey.ROUTINE_DETAIL, routineId])
    });
};
