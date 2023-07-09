import { useQuery } from "@tanstack/react-query";
import { QUERY_NUTRITIONAL_PLANS } from "utils/consts";
import { getNutritionalPlansSparse } from "services/nutritionalPlan";

export function useNutritionalPlansQuery() {
    return useQuery([QUERY_NUTRITIONAL_PLANS], getNutritionalPlansSparse);
}
