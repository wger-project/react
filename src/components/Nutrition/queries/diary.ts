import {
    addNutritionalDiaryEntry,
    deleteNutritionalDiaryEntry,
    editNutritionalDiaryEntry,
    getNutritionalDiaryEntries,
    NutritionalDiaryEntriesOptions
} from "@/components/Nutrition/api/nutritionalDiary";
import { DiaryEntry } from "@/components/Nutrition/models/diaryEntry";
import { QueryKey } from "@/core/lib/consts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useNutritionDiaryQuery = (options?: NutritionalDiaryEntriesOptions) => useQuery({
    queryFn: () => getNutritionalDiaryEntries(options),
    queryKey: [QueryKey.NUTRITIONAL_PLAN_DIARY, JSON.stringify(options || {})],
});

export const useAddDiaryEntryQuery = (planId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (diaryEntry: DiaryEntry) => addNutritionalDiaryEntry(diaryEntry),
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: [QueryKey.NUTRITIONAL_PLAN, planId]
        })
    });
};

export const useAddDiaryEntriesQuery = (planId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: DiaryEntry[]) => Promise.all(data.map(d => addNutritionalDiaryEntry(d))),
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
        mutationFn: (diaryEntry: DiaryEntry) => editNutritionalDiaryEntry(diaryEntry),
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: [QueryKey.NUTRITIONAL_PLAN, planId]
        })
    });
};