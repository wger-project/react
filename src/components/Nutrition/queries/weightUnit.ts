import { useQuery } from "@tanstack/react-query";
import { getWeightUnits } from "services/ingredientweightunit";
import { QueryKey } from "utils/consts";


export function useFetchWeightUnitsQuery(ingredientId: number | null) {
    return useQuery({
        queryKey: [QueryKey.INGREDIENT_WEIGHT_UNITS, ingredientId],
        queryFn: () => getWeightUnits(ingredientId!),
        enabled: ingredientId !== null,
    });
}
