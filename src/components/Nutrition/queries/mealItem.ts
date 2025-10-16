import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MealItem } from "components/Nutrition/models/mealItem";
import { addMealItem, deleteMealItem, editMealItem } from "services/mealItem";
import { QueryKey } from "utils/consts";

export const useAddMealItemQuery = (planId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (mealItem: MealItem) => addMealItem(mealItem),
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
        mutationFn: (mealItem: MealItem) => editMealItem(mealItem),
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
