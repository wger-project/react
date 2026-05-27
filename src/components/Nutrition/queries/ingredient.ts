import { getIngredient, IngredientSearchFilters, searchIngredient } from "@/components/Nutrition/api/ingredient";
import { QueryKey } from "@/core/lib/consts";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";


export function useFetchIngredientQuery(ingredientId: number) {
    return useQuery({
        queryKey: [QueryKey.INGREDIENT, ingredientId],
        queryFn: () => getIngredient(ingredientId)
    });
}

/**
 * Imperative search hook for the ingredient autocompleter. It debounces typing
 * locally and then calls the returned function to fetch matches; React Query
 * caches identical queries so the dropdown doesn't re-fetch on the same input.
 */
export function useSearchIngredientQuery() {
    const queryClient = useQueryClient();
    return useCallback(
        (name: string, filters: IngredientSearchFilters) =>
            queryClient.fetchQuery({
                queryKey: [QueryKey.INGREDIENT_SEARCH, name, filters],
                queryFn: () => searchIngredient(name, filters),
            }),
        [queryClient],
    );
}

