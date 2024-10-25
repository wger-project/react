import { useQuery } from "@tanstack/react-query";
import { getCategories, getEquipment, getExercise, getExercises, getLanguages, getMuscles } from "services";
import {
    QUERY_CATEGORIES,
    QUERY_EQUIPMENT,
    QUERY_EXERCISE_DETAIL,
    QUERY_EXERCISES,
    QUERY_LANGUAGES,
    QUERY_MUSCLES
} from "utils/consts";
import { number } from "yup";


export function useExercisesQuery() {
    return useQuery({
        queryKey: [QUERY_EXERCISES],
        queryFn: getExercises
    });
}

export function useExerciseDetailQuery(exerciseId: number) {
    return useQuery({
        queryKey: [QUERY_EXERCISE_DETAIL, exerciseId],
        queryFn: () => getExercise(exerciseId)
    });
}

export function useCategoriesQuery() {
    return useQuery({
        queryKey: [QUERY_CATEGORIES],
        queryFn: getCategories
    });
}

export function useMusclesQuery() {
    return useQuery({
        queryKey: [QUERY_MUSCLES],
        queryFn: getMuscles
    });
}

export function useEquipmentQuery() {
    return useQuery({
        queryKey: [QUERY_EQUIPMENT],
        queryFn: getEquipment
    });
}

export function useLanguageQuery() {
    return useQuery({
        queryKey: [QUERY_LANGUAGES],
        queryFn: getLanguages
    });
}

export function useNotesQuery(translationId: number) {
    return useQuery({
        queryKey: [QUERY_LANGUAGES, translationId],
        queryFn: getLanguages
    });
}
