import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addFullExercise, getExercise, getExercises } from "services";
import { AddExerciseFullProps } from "services/exercise";
import { QueryKey } from "utils/consts";

export function useExercisesQuery() {
    return useQuery({
        queryKey: [QueryKey.EXERCISES],
        queryFn: getExercises
    });
}

export function useExerciseQuery(id: number) {
    return useQuery({
        queryKey: [QueryKey.EXERCISE_DETAIL, id],
        queryFn: () => getExercise(id)
    });
}

export function useAddExerciseFullQuery() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: AddExerciseFullProps) => addFullExercise(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QueryKey.EXERCISES] });
        }
    });
}
