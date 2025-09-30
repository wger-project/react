import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Meal } from "components/Nutrition/models/meal";
import { addMeal, deleteMeal, editMeal } from "services/meal";
import { QueryKey } from "utils/consts";

export const useAddMealQuery = (planId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: Meal) => addMeal(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QueryKey.NUTRITIONAL_PLAN, planId]
            });
        }
    });
};
export const useDeleteMealQuery = (planId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => deleteMeal(id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QueryKey.NUTRITIONAL_PLAN, planId]
            });
        }
    });
};
export const useEditMealQuery = (planId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (meal: Meal) => editMeal(meal),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QueryKey.NUTRITIONAL_PLAN, planId]
            });
        }
    });
};