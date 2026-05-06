import { addFullExercise, getExercise, getExercises, getExercisesForVariation } from "@/services";
import { AddExerciseFullProps } from "@/services/exercise";
import { QueryKey } from "@/core/lib/consts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

export function useAddExerciseFullQuery() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: AddExerciseFullProps) => addFullExercise(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QueryKey.EXERCISES] });
        }
    });
}
