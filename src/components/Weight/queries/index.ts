import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MeasurementEntry } from "@/components/Measurements";
import {
    createWeight,
    deleteWeight,
    getBodyWeightCategory,
    getWeights,
    updateWeight
} from "@/components/Weight/api/weight";
import { useProfileQuery } from "@/components/User";
import { QueryKey, } from "@/core/lib/consts";
import { WeightUnit } from "@/core/lib/weightUnit";

/*
 * The official body weight category basically never changes, resolve it once
 * per session (ensureQueryData returns the cached result on later calls)
 */
const bodyWeightCategoryQueryOptions = {
    queryKey: [QueryKey.BODY_WEIGHT_CATEGORY],
    // Called through, not captured: this module sits in an import cycle
    // between the weight, measurement and nutrition domains, where a binding
    // read while the modules initialise can still be undefined
    queryFn: () => getBodyWeightCategory(),
};

export function useBodyWeightCategoryQuery() {
    return useQuery(bodyWeightCategoryQueryOptions);
}

/*
 * The unit weight values are displayed in: the user's profile weight unit.
 * Entries keep the unit they were entered in, only the presentation converts.
 */
export function useDisplayWeightUnit(): WeightUnit {
    const profileQuery = useProfileQuery();

    return profileQuery.data?.useMetric === false ? 'lb' : 'kg';
}

/**
 * Body weight entries, newest first.
 *
 * The filterset is the one the measurement queries take (`entryFilterFor` for
 * a chart range, explicit date bounds otherwise), so a screen fetches what it
 * shows instead of the whole history.
 */
export function useBodyWeightQuery(filtersetQueryEntries: object = {}) {
    const queryClient = useQueryClient();

    return useQuery({
        queryKey: [QueryKey.BODY_WEIGHT, JSON.stringify(filtersetQueryEntries)],
        queryFn: async () => {
            const category = await queryClient.ensureQueryData(bodyWeightCategoryQueryOptions);
            return getWeights(category, filtersetQueryEntries);
        },
        // Widening the range refetches, and the chart would otherwise drop
        // back to the loading placeholder while the longer history arrives
        placeholderData: keepPreviousData,
    });
}

export const useDeleteWeightEntryQuery = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => deleteWeight(id),
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: [QueryKey.BODY_WEIGHT]
        })
    });
};


export const useAddWeightEntryQuery = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (weightEntry: MeasurementEntry) => createWeight(weightEntry),
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: [QueryKey.BODY_WEIGHT,]
        })
    });
};

export const useEditWeightEntryQuery = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: MeasurementEntry) => updateWeight(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QueryKey.BODY_WEIGHT,]
            });
        }
    });
};
