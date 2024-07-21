import { useQuery } from "@tanstack/react-query";
import { getIngredient } from "services";
import { QueryKey } from "utils/consts";


export function useFetchIngredientQuery(ingredientId: number) {
    return useQuery({
        queryKey: [QueryKey.INGREDIENT, ingredientId],
        queryFn: () => getIngredient(ingredientId)
    });
}

