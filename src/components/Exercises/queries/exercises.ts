import {
    AddExerciseFullProps,
    addFullExercise,
    getExercise,
    getExercises,
    getExercisesByUuids,
    getExercisesForVariation
} from "@/components/Exercises/api/exercise";
import { Exercise } from "@/components/Exercises/models/exercise";
import { QueryKey } from "@/core/lib/consts";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

export function useExercisesQuery() {
    return useQuery({
        queryKey: [QueryKey.EXERCISES],
        queryFn: getExercises
    });
}

export function useExerciseQuery(id: number) {
    return useQuery({
        queryKey: [QueryKey.EXERCISE_DETAIL, id],
        queryFn: () => getExercise(id)
    });
}

/**
 * Imperative variant of `useExerciseQuery` for one-shot fetches in event
 * handlers. Returns a function that fetches and caches under the same key as
 * `useExerciseQuery`, so subsequent renders reading the same id will hit
 * the cache.
 */
export function useFetchExerciseQuery() {
    const queryClient = useQueryClient();
    return useCallback(
        (id: number) => queryClient.fetchQuery({
            queryKey: [QueryKey.EXERCISE_DETAIL, id],
            queryFn: () => getExercise(id),
        }),
        [queryClient],
    );
}

/**
 * Fetch the sibling exercises that share a variation group. Disabled until
 * a variationGroup is provided; the service itself returns [] for null/
 * undefined, so this also avoids the redundant network round-trip.
 */
export function useExercisesForVariationQuery(variationGroup: string | null | undefined) {
    return useQuery({
        queryKey: [QueryKey.EXERCISE_VARIATIONS, variationGroup],
        queryFn: () => getExercisesForVariation(variationGroup),
        enabled: !!variationGroup,
    });
}

/**
 * One query per exercise id, under the same key useExerciseQuery reads, so a
 * record either side loaded answers for the other. Kept fresh forever: an
 * exercise record does not change while a form is open, and a seeded one
 * would otherwise be refetched right away.
 */
export function useExercisesDetailQueries(ids: number[]) {
    return useQueries({
        queries: ids.map(id => ({
            queryKey: [QueryKey.EXERCISE_DETAIL, id],
            queryFn: () => getExercise(id),
            staleTime: Infinity,
        })),
    });
}

/** Seeds the detail key with a record already in hand, e.g. from the autocompleter */
export function usePrimeExercise() {
    const queryClient = useQueryClient();
    return useCallback(
        (exercise: Exercise) =>
            queryClient.setQueryData([QueryKey.EXERCISE_DETAIL, exercise.id], exercise),
        [queryClient],
    );
}

/**
 * Imperative fetch of the exercises behind a fixed set of uuids, for one-shot
 * prefills in event handlers. The result is cached forever under the uuids,
 * and every record is also seeded under the detail key, so the chips that
 * name one render without a fetch of their own.
 */
export function useFetchExercisesByUuidsQuery() {
    const queryClient = useQueryClient();
    return useCallback(
        async (uuids: string[]) => {
            const exercises = await queryClient.ensureQueryData({
                queryKey: [QueryKey.EXERCISES, 'by-uuid', uuids],
                queryFn: () => getExercisesByUuids(uuids),
                staleTime: Infinity,
            });
            for (const exercise of exercises) {
                queryClient.setQueryData([QueryKey.EXERCISE_DETAIL, exercise.id], exercise);
            }
            return exercises;
        },
        [queryClient],
    );
}

export function useAddExerciseFullQuery() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: AddExerciseFullProps) => addFullExercise(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QueryKey.EXERCISES] });
        }
    });
}
