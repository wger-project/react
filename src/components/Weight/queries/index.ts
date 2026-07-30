import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { WeightEntry } from "@/components/Weight/models/WeightEntry";
import {
    createWeight,
    deleteWeight,
    getBodyWeightCategory,
    getWeights,
    updateWeight
} from "@/components/Weight/api/weight";
import { QueryKey, } from "@/core/lib/consts";
import { FilterType } from "../widgets/FilterButtons";

/*
 * The official body weight category basically never changes, resolve it once
 * per session (ensureQueryData returns the cached result on later calls)
 */
const bodyWeightCategoryQueryOptions = {
    queryKey: [QueryKey.BODY_WEIGHT_CATEGORY],
    queryFn: getBodyWeightCategory,
};

export function useBodyWeightCategoryQuery() {
    return useQuery(bodyWeightCategoryQueryOptions);
}

export function useBodyWeightQuery(filter: FilterType = 'lastWeek') {
    const queryClient = useQueryClient();

    return useQuery({
        queryKey: [QueryKey.BODY_WEIGHT, filter],
        queryFn: async () => {
            const category = await queryClient.ensureQueryData(bodyWeightCategoryQueryOptions);
            return getWeights(category.id!, filter);
        },
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
        mutationFn: async (weightEntry: WeightEntry) => {
            const category = await queryClient.ensureQueryData(bodyWeightCategoryQueryOptions);
            return createWeight(weightEntry, category.id!);
        },
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: [QueryKey.BODY_WEIGHT,]
        })
    });
};

export const useEditWeightEntryQuery = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: WeightEntry) => updateWeight(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QueryKey.BODY_WEIGHT,]
            });
        }
    });
};
