import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { NutritionalPlan } from "@/components/Nutrition/models/nutritionalPlan";
import {
    addNutritionalPlan,
    deleteNutritionalPlan,
    editNutritionalPlan,
    getLastNutritionalPlan,
    getNutritionalPlanFull,
    getNutritionalPlansSparse
} from "@/components/Nutrition/api/nutritionalPlan";
import { QueryKey } from "@/core/lib/consts";

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

export function useFetchNutritionalPlanQuery(planId: string) {
    return useQuery({
        queryKey: [QueryKey.NUTRITIONAL_PLAN, planId],
        queryFn: () => getNutritionalPlanFull(planId)
    });
}

/*
 * Fetches the full nutritional plan (meals, etc.), but only the diary entries for
 * the given date
 */
export function useFetchNutritionalPlanDateQuery(planId: string | null, dateStr: string, enabled = true) {
    return useQuery({
        queryKey: [QueryKey.NUTRITIONAL_PLAN, planId, dateStr],
        // dateStr already is a YYYY-MM-DD string (from the URL), pass it through
        // as-is: round-tripping it through new Date() would parse it as UTC
        // midnight and shift the day in timezones behind UTC
        queryFn: () => getNutritionalPlanFull(planId, { filtersetQueryLogs: { "datetime__eq": dateStr } }),
        enabled: enabled,
    });
}

export const useAddNutritionalPlanQuery = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (plan: NutritionalPlan) => addNutritionalPlan(plan),
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

export const useDeleteNutritionalPlanQuery = (id: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => deleteNutritionalPlan(id),
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
export const useEditNutritionalPlanQuery = (id: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (plan: NutritionalPlan) => editNutritionalPlan(plan),
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