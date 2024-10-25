import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addMealItem, AddMealItemParams, deleteMealItem, editMealItem, EditMealItemParams } from "services/mealItem";
import { QueryKey } from "utils/consts";
import { number } from "yup";

export const useAddMealItemQuery = (planId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: AddMealItemParams) => addMealItem(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QueryKey.NUTRITIONAL_PLAN, planId]
            });
        }
    });
};

export const useEditMealItemQuery = (planId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: EditMealItemParams) => editMealItem(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QueryKey.NUTRITIONAL_PLAN, planId]
            });
        }
    });
};

export const useDeleteMealItemQuery = (planId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => deleteMealItem(id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QueryKey.NUTRITIONAL_PLAN, planId]
            });
        }
    });
};
