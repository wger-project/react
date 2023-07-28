import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_NUTRITIONAL_PLAN, QUERY_NUTRITIONAL_PLANS } from "utils/consts";
import {
    addNutritionalPlan,
    AddNutritionalPlanParams,
    deleteNutritionalPlan,
    editNutritionalPlan,
    EditNutritionalPlanParams,
    getNutritionalPlanFull,
    getNutritionalPlansSparse
} from "services/nutritionalPlan";

export function useFetchNutritionalPlansQuery() {
    return useQuery([QUERY_NUTRITIONAL_PLANS], getNutritionalPlansSparse);
}

export function useFetchNutritionalPlanQuery(planId: number) {
    return useQuery(
        [QUERY_NUTRITIONAL_PLAN, planId],
        () => getNutritionalPlanFull(planId)
    );
}

export const useAddNutritionalPlanQuery = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: AddNutritionalPlanParams) => addNutritionalPlan(data),
        onSuccess: () => {
            queryClient.invalidateQueries([QUERY_NUTRITIONAL_PLANS,]);
            queryClient.invalidateQueries([QUERY_NUTRITIONAL_PLAN,]);
        }
    });
};
export const useDeleteNutritionalPlanQuery = (id: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => deleteNutritionalPlan(id),
        onSuccess: () => {
            queryClient.invalidateQueries([QUERY_NUTRITIONAL_PLAN, id]);
            queryClient.invalidateQueries([QUERY_NUTRITIONAL_PLANS,]);
        }
    });
};
export const useEditNutritionalPlanQuery = (id: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: EditNutritionalPlanParams) => editNutritionalPlan(data),
        onSuccess: () => {
            queryClient.invalidateQueries([QUERY_NUTRITIONAL_PLAN, id]);
            queryClient.invalidateQueries([QUERY_NUTRITIONAL_PLANS,]);
        }
    });
};