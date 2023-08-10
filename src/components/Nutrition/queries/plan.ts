import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    addNutritionalPlan,
    AddNutritionalPlanParams,
    deleteNutritionalPlan,
    editNutritionalPlan,
    EditNutritionalPlanParams,
    getNutritionalPlanFull,
    getNutritionalPlansSparse
} from "services/nutritionalPlan";
import { QUERY_NUTRITIONAL_PLANS, QueryKey } from "utils/consts";

export function useFetchNutritionalPlansQuery() {
    return useQuery([QUERY_NUTRITIONAL_PLANS], getNutritionalPlansSparse);
}

export function useFetchNutritionalPlanQuery(planId: number) {
    return useQuery(
        [QueryKey.NUTRITIONAL_PLAN, planId],
        () => getNutritionalPlanFull(planId)
    );
}

/*
 * Fetches the full nutritional plan (meals, etc.), but only the diary entries for
 * the given date
 */
export function useFetchNutritionalPlanDateQuery(planId: number, dateStr: string) {
    return useQuery(
        [QueryKey.NUTRITIONAL_PLAN, planId, dateStr],
        () => getNutritionalPlanFull(planId, new Date(dateStr))
    );
}

export const useAddNutritionalPlanQuery = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: AddNutritionalPlanParams) => addNutritionalPlan(data),
        onSuccess: () => {
            queryClient.invalidateQueries([QUERY_NUTRITIONAL_PLANS,]);
            queryClient.invalidateQueries([QueryKey.NUTRITIONAL_PLAN,]);
        }
    });
};
export const useDeleteNutritionalPlanQuery = (id: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => deleteNutritionalPlan(id),
        onSuccess: () => {
            queryClient.invalidateQueries([QUERY_NUTRITIONAL_PLANS,]);
            queryClient.invalidateQueries([QueryKey.NUTRITIONAL_PLAN, id]);
        }
    });
};
export const useEditNutritionalPlanQuery = (id: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: EditNutritionalPlanParams) => editNutritionalPlan(data),
        onSuccess: () => {
            queryClient.invalidateQueries([QueryKey.NUTRITIONAL_PLAN, id]);
            queryClient.invalidateQueries([QUERY_NUTRITIONAL_PLANS,]);
        }
    });
};