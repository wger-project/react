import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SlotEntry } from "@/components/Routines/models/SlotEntry";
import { deleteSlotEntry, editSlotEntry } from "@/services";
import { addSlotEntry } from "@/services/slot_entry";
import { QueryKey, } from "@/core/lib/consts";


export const useEditSlotEntryQuery = (routineId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (slotEntry: SlotEntry) => editSlotEntry(slotEntry),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [QueryKey.ROUTINE_DETAIL, routineId] })
    });
};

export const useAddSlotEntryQuery = (routineId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (slotEntry: SlotEntry) => addSlotEntry(slotEntry),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [QueryKey.ROUTINE_DETAIL, routineId] })
    });
};

export const useDeleteSlotEntryQuery = (routineId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (slotId: number) => deleteSlotEntry(slotId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [QueryKey.ROUTINE_DETAIL, routineId] })
    });
};
