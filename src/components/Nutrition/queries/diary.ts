import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DiaryEntry } from "components/Nutrition/models/diaryEntry";
import {
    addNutritionalDiaryEntry,
    deleteNutritionalDiaryEntry,
    editNutritionalDiaryEntry,
    getNutritionalDiaryEntries
} from "services";
import { NutritionalDiaryEntriesOptions } from "services/nutritionalDiary";
import { QueryKey } from "utils/consts";

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