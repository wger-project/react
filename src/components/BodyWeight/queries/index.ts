import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { WeightEntry } from "components/BodyWeight/model";
import { createWeight, deleteWeight, getWeights, updateWeight, } from "services";
import { QueryKey, } from "utils/consts";


export function useBodyWeightQuery() {
    return useQuery([QueryKey.BODY_WEIGHT], getWeights);
}

export const useDeleteWeightEntryQuery = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => deleteWeight(id),
        onSuccess: () => queryClient.invalidateQueries([QueryKey.BODY_WEIGHT])
    });
};


export const useAddWeightEntryQuery = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: WeightEntry) => createWeight(data),
        onError: (error: any) => {
            console.log(error);
        },
        onSuccess: () => queryClient.invalidateQueries([QueryKey.BODY_WEIGHT,])
    });
};

export const useEditWeightEntryQuery = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: WeightEntry) => updateWeight(data),
        onSuccess: () => {
            queryClient.invalidateQueries([QueryKey.BODY_WEIGHT,]);
        }
    });
};