import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    addTranslation,
    editTranslation,
    getCategories,
    getEquipment,
    getLanguages,
    getMuscles,
    postExerciseImage
} from "services";
import { AddTranslationParams, EditTranslationParams } from "services/exerciseTranslation";
import { deleteExerciseImage, PostExerciseImageParams } from "services/image";
import { QueryKey } from "utils/consts";

export { useExercisesQuery, useExerciseQuery, useAddExerciseFullQuery } from "./exercises";


export function useAddTranslationQuery(exerciseId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: AddTranslationParams) => addTranslation(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QueryKey.EXERCISES] });
            queryClient.invalidateQueries({ queryKey: [QueryKey.EXERCISE_DETAIL, exerciseId] });
        }
    });
}

export function useEditTranslationQuery(exerciseId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: EditTranslationParams) => editTranslation(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QueryKey.EXERCISES] });
            queryClient.invalidateQueries({ queryKey: [QueryKey.EXERCISE_DETAIL, exerciseId] });
        }
    });
}

export function useDeleteExerciseImageQuery(exerciseId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => deleteExerciseImage(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QueryKey.EXERCISES] });
            queryClient.invalidateQueries({ queryKey: [QueryKey.EXERCISE_DETAIL, exerciseId] });
        }
    });
}

export function useAddExerciseImageQuery(exerciseId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: PostExerciseImageParams) => postExerciseImage(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QueryKey.EXERCISES] });
            queryClient.invalidateQueries({ queryKey: [QueryKey.EXERCISE_DETAIL, exerciseId] });
        }
    });
}


export function useCategoriesQuery() {
    return useQuery({
        queryKey: [QueryKey.CATEGORIES],
        queryFn: getCategories
    });
}

export function useMusclesQuery() {
    return useQuery({
        queryKey: [QueryKey.MUSCLES],
        queryFn: getMuscles
    });
}

export function useEquipmentQuery() {
    return useQuery({
        queryKey: [QueryKey.EQUIPMENT],
        queryFn: getEquipment
    });
}

export function useLanguageQuery() {
    return useQuery({
        queryKey: [QueryKey.LANGUAGES],
        queryFn: getLanguages
    });
}

export function useNotesQuery(translationId: number) {
    return useQuery({
        queryKey: [QueryKey.LANGUAGES, translationId],
        queryFn: getLanguages
    });
}
