import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_NUTRITIONAL_PLAN, QUERY_NUTRITIONAL_PLANS } from "utils/consts";
import {
    addNutritionalPlan,
    addNutritionalPlanParams,
    deleteNutritionalPlan,
    editNutritionalPlan,
    editNutritionalPlanParams,
    getNutritionalPlanFull,
    getNutritionalPlansSparse
} from "services/nutritionalPlan";

export function useFetchNutritionalPlansQuery() {
    return useQuery([QUERY_NUTRITIONAL_PLANS], getNutritionalPlansSparse);
}

export function useFetchNutritionalPlanQuery(id: number) {
    return useQuery(
        [QUERY_NUTRITIONAL_PLAN, id],
        () => getNutritionalPlanFull(id)
    );
}

export const useAddNutritionalPlanQueryQuery = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: addNutritionalPlanParams) => addNutritionalPlan(data),
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
        mutationFn: (data: editNutritionalPlanParams) => editNutritionalPlan(data),
        onSuccess: () => {
            queryClient.invalidateQueries([QUERY_NUTRITIONAL_PLAN, id]);
            queryClient.invalidateQueries([QUERY_NUTRITIONAL_PLANS,]);
        }
    });
};