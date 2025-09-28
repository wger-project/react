import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SlotEntry } from "components/WorkoutRoutines/models/SlotEntry";
import { deleteSlotEntry, editSlotEntry } from "services";
import { addSlotEntry, AddSlotEntryParams } from "services/slot_entry";
import { QueryKey, } from "utils/consts";


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
        mutationFn: (data: AddSlotEntryParams) => addSlotEntry(data),
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
