import { SearchLanguageFilter } from "@/components/Core/Widgets/SearchLanguageFilter";
import { Note } from "@/components/Exercises/models/note";
import {
    addNote,
    addTranslation,
    deleteAlias,
    deleteExercise,
    deleteExerciseTranslation,
    deleteNote,
    editExercise,
    editNote,
    editTranslation,
    getCategories,
    getEquipment,
    getLanguages,
    getMuscles,
    postAlias,
    postExerciseImage,
    searchExerciseTranslations,
} from "@/services";
import { DeleteExerciseOptions, EditExerciseProps } from "@/services/exercise";
import { AddTranslationParams, EditTranslationParams } from "@/services/exerciseTranslation";
import {
    deleteExerciseImage,
    patchExerciseImage,
    PatchExerciseImageParams,
    PostExerciseImageParams
} from "@/services/image";
import { deleteExerciseVideo, postExerciseVideo, PostExerciseVideoParams } from "@/services/video";
import { QueryKey } from "@/utils/consts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

export {
    useAddExerciseFullQuery,
    useExerciseQuery,
    useExercisesForVariationQuery,
    useExercisesQuery,
    useFetchExerciseQuery,
} from "./exercises";

/**
 * Patch an existing exercise. The exercise id is part of the mutation
 * payload (rather than fixed at hook construction) so a single hook
 * instance can patch different exercises
 */
export function useEditExerciseQuery() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: EditExerciseProps }) => editExercise(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: [QueryKey.EXERCISES] });
            queryClient.invalidateQueries({ queryKey: [QueryKey.EXERCISE_DETAIL, id] });
        },
    });
}

/**
 * Delete an exercise. After success the detail entry is removed from the
 * cache (the data is gone, not just stale) and the list is invalidated.
 */
export function useDeleteExerciseQuery(exerciseId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (options?: DeleteExerciseOptions) => deleteExercise(exerciseId, options),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QueryKey.EXERCISES] });
            queryClient.removeQueries({ queryKey: [QueryKey.EXERCISE_DETAIL, exerciseId] });
        },
    });
}

/**
 * Delete a single exercise translation. The parent exercise's detail and
 * the list of exercises are invalidated so the translation drops out of
 * the UI.
 */
export function useDeleteExerciseTranslationQuery(exerciseId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (translationId: number) => deleteExerciseTranslation(translationId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QueryKey.EXERCISES] });
            queryClient.invalidateQueries({ queryKey: [QueryKey.EXERCISE_DETAIL, exerciseId] });
        },
    });
}

/**
 * Imperative search hook for the exercise autocompleter. It debounces typing
 * locally and then calls the returned function to fetch matches; React Query
 * caches identical queries so the dropdown doesn't re-fetch on the same input.
 */
export function useSearchExerciseTranslationsQuery() {
    const queryClient = useQueryClient();
    return useCallback(
        (
            name: string,
            languageCode: string,
            languageFilter: SearchLanguageFilter,
            exactMatch: boolean,
        ) => queryClient.fetchQuery({
            queryKey: [QueryKey.EXERCISE_TRANSLATION_SEARCH, name, languageCode, languageFilter, exactMatch],
            queryFn: () => searchExerciseTranslations(name, languageCode, languageFilter, exactMatch),
        }),
        [queryClient],
    );
}

export function useAddTranslationQuery(exerciseId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: AddTranslationParams) => addTranslation(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QueryKey.EXERCISES] });
            queryClient.invalidateQueries({ queryKey: [QueryKey.EXERCISE_DETAIL, exerciseId] });
        },
    });
}

export function useEditTranslationQuery(exerciseId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: EditTranslationParams) => editTranslation(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QueryKey.EXERCISES] });
            queryClient.invalidateQueries({ queryKey: [QueryKey.EXERCISE_DETAIL, exerciseId] });
        },
    });
}

export function useDeleteExerciseImageQuery(exerciseId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => deleteExerciseImage(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QueryKey.EXERCISES] });
            queryClient.invalidateQueries({ queryKey: [QueryKey.EXERCISE_DETAIL, exerciseId] });
        },
    });
}

export function useAddExerciseImageQuery() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: PostExerciseImageParams) => postExerciseImage(data),
        onSuccess: (_, data) => {
            queryClient.invalidateQueries({ queryKey: [QueryKey.EXERCISES] });
            queryClient.invalidateQueries({ queryKey: [QueryKey.EXERCISE_DETAIL, data.exerciseId] });
        },
    });
}

export function useEditExerciseImageQuery(exerciseId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: PatchExerciseImageParams) => patchExerciseImage(data),
        onSuccess: () => {
            // Invalidate the cache so the UI shows the updated title/author immediately
            queryClient.invalidateQueries({ queryKey: [QueryKey.EXERCISES] });
            queryClient.invalidateQueries({ queryKey: [QueryKey.EXERCISE_DETAIL, exerciseId] });
        }
    });
}

/**
 * A query hook to add a new alias to a translation. Invalidates the parent
 * exercise queries on success so that newly added aliases are reflected in
 * the cached exercise data.
 */
export function usePostAliasQuery(exerciseId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ translationId, alias }: { translationId: number; alias: string }) =>
            postAlias(translationId, alias),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QueryKey.EXERCISES] });
            queryClient.invalidateQueries({ queryKey: [QueryKey.EXERCISE_DETAIL, exerciseId] });
        },
    });
}

/**
 * A query hook to delete an existing alias. Invalidates the parent exercise
 * queries on success.
 */
export function useDeleteAliasQuery(exerciseId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (aliasId: number) => deleteAlias(aliasId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QueryKey.EXERCISES] });
            queryClient.invalidateQueries({ queryKey: [QueryKey.EXERCISE_DETAIL, exerciseId] });
        },
    });
}

/**
 * A query hook to add a new exercise video
 * @param exerciseId {number} - Exercise ID to which the uploaded video will be added to
 * @returns {useMutation} A mutation object to manage the video upload process
 */
export function useAddExerciseVideoQuery(exerciseId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: PostExerciseVideoParams) => postExerciseVideo(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QueryKey.EXERCISES] });
            queryClient.invalidateQueries({ queryKey: [QueryKey.EXERCISE_DETAIL, exerciseId] });
        },
    });
}

/**
 * A query hook to delete a exercise video
 * @param exerciseId {number} - Exercise ID to which the video is linked
 * @returns {useMutation} A mutation object to manage the video deletion process
 */
export function useDeleteExerciseVideoQuery(exerciseId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => deleteExerciseVideo(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QueryKey.EXERCISES] });
            queryClient.invalidateQueries({ queryKey: [QueryKey.EXERCISE_DETAIL, exerciseId] });
        },
    });
}

export function useCategoriesQuery() {
    return useQuery({
        queryKey: [QueryKey.CATEGORIES],
        queryFn: getCategories,
    });
}

export function useMusclesQuery() {
    return useQuery({
        queryKey: [QueryKey.MUSCLES],
        queryFn: getMuscles,
    });
}

export function useEquipmentQuery() {
    return useQuery({
        queryKey: [QueryKey.EQUIPMENT],
        queryFn: getEquipment,
    });
}

export function useLanguageQuery() {
    return useQuery({
        queryKey: [QueryKey.LANGUAGES],
        queryFn: getLanguages,
    });
}

export function useAddNoteQuery(exerciseId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (note: Note) => addNote(note),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QueryKey.EXERCISES] });
            queryClient.invalidateQueries({ queryKey: [QueryKey.EXERCISE_DETAIL, exerciseId] });
        },
    });
}

export function useEditNoteQuery(exerciseId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (note: Note) => editNote(note),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QueryKey.EXERCISES] });
            queryClient.invalidateQueries({ queryKey: [QueryKey.EXERCISE_DETAIL, exerciseId] });
        },
    });
}

export function useDeleteNoteQuery(exerciseId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => deleteNote(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QueryKey.EXERCISES] });
            queryClient.invalidateQueries({ queryKey: [QueryKey.EXERCISE_DETAIL, exerciseId] });
        },
    });
}
