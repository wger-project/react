import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addMeal, AddMealParams, deleteMeal, editMeal, EditMealParams } from "services/meal";
import { QueryKey } from "utils/consts";

export const useAddMealQuery = (planId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: AddMealParams) => addMeal(data),
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
        mutationFn: (data: EditMealParams) => editMeal(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QueryKey.NUTRITIONAL_PLAN, planId]
            });
        }
    });
};