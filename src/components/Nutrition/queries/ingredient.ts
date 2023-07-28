import { useQuery } from "@tanstack/react-query";
import { QueryKeys } from "utils/consts";
import { getIngredient } from "services";


export function useFetchIngredientQuery(ingredientId: number) {
    return useQuery(
        [QueryKeys.INGREDIENT, ingredientId],
        () => getIngredient(ingredientId)
    );
}

