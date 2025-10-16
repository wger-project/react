import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addVariation } from "services/variation";
import { QueryKey } from "utils/consts";

export function useAddVariationQuery() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => addVariation(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QueryKey.EXERCISES] });
        }
    });
}

