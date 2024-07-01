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


export function useExercisesQuery() {
    return useQuery([QUERY_EXERCISES], getExercises);
}

export function useExerciseDetailQuery(exerciseId: number) {
    return useQuery([QUERY_EXERCISE_DETAIL, exerciseId],
        () => getExercise(exerciseId)
    );
}

export function useCategoriesQuery() {
    return useQuery([QUERY_CATEGORIES], getCategories);
}

export function useMusclesQuery() {
    return useQuery([QUERY_MUSCLES], getMuscles);
}

export function useEquipmentQuery() {
    return useQuery([QUERY_EQUIPMENT], getEquipment);
}

export function useLanguageQuery() {
    return useQuery([QUERY_LANGUAGES], getLanguages);
}

export function useNotesQuery(translationId: number) {
    return useQuery([QUERY_LANGUAGES, translationId], getLanguages);
}
