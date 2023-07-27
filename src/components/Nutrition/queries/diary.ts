import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    AddDiaryEntryParams,
    addNutritionalDiaryEntry,
    deleteNutritionalDiaryEntry,
    EditDiaryEntryParams,
    editNutritionalDiaryEntry,
    getNutritionalDiaryEntries
} from "services/nutritionalDiary";
import { QUERY_NUTRITIONAL_PLAN } from "utils/consts";

export function useFetchDiaryEntriesQuery(planId: number) {
    return useQuery(
        [QUERY_NUTRITIONAL_PLAN, planId],
        () => getNutritionalDiaryEntries(planId)
    );
}

export const useAddDiaryEntryQuery = (planId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: AddDiaryEntryParams) => addNutritionalDiaryEntry(data),
        onSuccess: () => queryClient.invalidateQueries([QUERY_NUTRITIONAL_PLAN, planId])
    });
};
export const useDeleteDiaryEntryQuery = (planId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => deleteNutritionalDiaryEntry(id),
        onSuccess: () => queryClient.invalidateQueries([QUERY_NUTRITIONAL_PLAN, planId])
    });
};
export const useEditDiaryEntryQuery = (planId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: EditDiaryEntryParams) => editNutritionalDiaryEntry(data),
        onSuccess: () => queryClient.invalidateQueries([QUERY_NUTRITIONAL_PLAN, planId])
    });
};