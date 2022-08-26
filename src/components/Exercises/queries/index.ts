import { useQuery } from "@tanstack/react-query";
import { QUERY_CATEGORIES, QUERY_EQUIPMENT, QUERY_EXERCISE_BASES, QUERY_LANGUAGES, QUERY_MUSCLES } from "utils/consts";
import { getCategories, getEquipment, getExerciseBases, getLanguages, getMuscles } from "services";


export function useBasesQuery() {
    return useQuery([QUERY_EXERCISE_BASES], getExerciseBases);
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
