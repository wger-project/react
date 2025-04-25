import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    AddDiaryEntryParams,
    addNutritionalDiaryEntry,
    deleteNutritionalDiaryEntry,
    EditDiaryEntryParams,
    editNutritionalDiaryEntry,
    getNutritionalDiaryEntries,
    NutritionalDiaryEntriesOptions
} from "services/nutritionalDiary";
import { QueryKey } from "utils/consts";

export const useNutritionDiaryQuery = (options?: NutritionalDiaryEntriesOptions) => useQuery({
    queryFn: () => getNutritionalDiaryEntries(options),
    queryKey: [QueryKey.NUTRITIONAL_PLAN_DIARY, JSON.stringify(options || {})],
});

export const useAddDiaryEntryQuery = (planId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: AddDiaryEntryParams) => addNutritionalDiaryEntry(data),
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: [QueryKey.NUTRITIONAL_PLAN, planId]
        })
    });
};

export const useAddDiaryEntriesQuery = (planId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: AddDiaryEntryParams[]) => Promise.all(data.map(d => addNutritionalDiaryEntry(d))),
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: [QueryKey.NUTRITIONAL_PLAN, planId]
        })
    });
};

export const useDeleteDiaryEntryQuery = (planId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => deleteNutritionalDiaryEntry(id),
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: [QueryKey.NUTRITIONAL_PLAN, planId]
        })
    });
};

export const useEditDiaryEntryQuery = (planId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: EditDiaryEntryParams) => editNutritionalDiaryEntry(data),
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: [QueryKey.NUTRITIONAL_PLAN, planId]
        })
    });
};