import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    addNutritionalPlan,
    AddNutritionalPlanParams,
    deleteNutritionalPlan,
    editNutritionalPlan,
    EditNutritionalPlanParams,
    getLastNutritionalPlan,
    getNutritionalPlanFull,
    getNutritionalPlansSparse
} from "services/nutritionalPlan";
import { QueryKey } from "utils/consts";
import { dateToYYYYMMDD } from "utils/date";

export function useFetchNutritionalPlansQuery() {
    return useQuery({
        queryKey: [QueryKey.NUTRITIONAL_PLANS],
        queryFn: () => getNutritionalPlansSparse()
    });
}


export function useFetchLastNutritionalPlanQuery() {
    return useQuery({
        queryKey: [QueryKey.NUTRITIONAL_PLAN, 'last'],
        queryFn: () => getLastNutritionalPlan()
    });
}

export function useFetchNutritionalPlanQuery(planId: number) {
    return useQuery({
        queryKey: [QueryKey.NUTRITIONAL_PLAN, planId],
        queryFn: () => getNutritionalPlanFull(planId)
    });
}

/*
 * Fetches the full nutritional plan (meals, etc.), but only the diary entries for
 * the given date
 */
export function useFetchNutritionalPlanDateQuery(planId: number | null, dateStr: string, enabled = true) {
    return useQuery({
        queryKey: [QueryKey.NUTRITIONAL_PLAN, planId, dateStr],
        queryFn: () => getNutritionalPlanFull(planId, { filtersetQueryLogs: { "datetime__eq": dateToYYYYMMDD(new Date(dateStr)) } }),
        enabled: enabled,
    });
}

export const useAddNutritionalPlanQuery = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: AddNutritionalPlanParams) => addNutritionalPlan(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QueryKey.NUTRITIONAL_PLANS,]
            });
            queryClient.invalidateQueries({
                queryKey: [QueryKey.NUTRITIONAL_PLAN,]
            });
        }
    });
};

export const useDeleteNutritionalPlanQuery = (id: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => deleteNutritionalPlan(id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QueryKey.NUTRITIONAL_PLANS,]
            });
            queryClient.invalidateQueries({
                queryKey: [QueryKey.NUTRITIONAL_PLAN, id]
            });
        }
    });
};
export const useEditNutritionalPlanQuery = (id: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: EditNutritionalPlanParams) => editNutritionalPlan(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QueryKey.NUTRITIONAL_PLAN, id]
            });
            queryClient.invalidateQueries({
                queryKey: [QueryKey.NUTRITIONAL_PLANS,]
            });
        }
    });
};