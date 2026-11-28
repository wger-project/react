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
import { PlanPeriod } from "@/components/Measurements";
import { QueryKey } from "@/core/lib/consts";
import { useTranslation } from "react-i18next";

export function useFetchNutritionalPlansQuery(enabled = true) {
    return useQuery({
        queryKey: [QueryKey.NUTRITIONAL_PLANS],
        queryFn: () => getNutritionalPlansSparse(),
        enabled: enabled,
    });
}

/**
 * The plans as periods a measurement chart can shade, newest first. A plan
 * without an end date is still running, so its period reaches up to now.
 *
 * Pass enabled=false where the metric has nothing to do with nutrition, so
 * those charts do not fetch the plans at all.
 */
export function useNutritionPlanPeriods(enabled = true): PlanPeriod[] {
    const [t] = useTranslation();
    const query = useFetchNutritionalPlansQuery(enabled);

    return (query.data ?? []).map(plan => ({
        start: plan.start.getTime(),
        end: (plan.end ?? new Date()).getTime(),
        name: plan.description !== '' ? plan.description : t('nutrition.plan'),
    }));
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