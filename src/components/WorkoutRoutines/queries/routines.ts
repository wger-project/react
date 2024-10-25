import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getActiveRoutine, getRoutine, getRoutines, getRoutinesShallow } from "services";
import { addRoutine, AddRoutineParams, editRoutine, EditRoutineParams } from "services/routine";
import { QueryKey, } from "utils/consts";


export function useRoutinesQuery() {
    return useQuery({
        queryKey: [QueryKey.ROUTINE_OVERVIEW],
        queryFn: getRoutines
    });
}

export function useRoutineDetailQuery(id: number) {
    return useQuery({
        queryKey: [QueryKey.ROUTINE_DETAIL, id],
        queryFn: () => getRoutine(id)
    });
}

/*
 * Retrieves all routines
 *
 * Note: strictly only the routine data, no days or any other sub-objects
 */
export function useRoutinesShallowQuery() {
    return useQuery({
        queryKey: [QueryKey.ROUTINES_SHALLOW],
        queryFn: getRoutinesShallow
    });
}

/*
 * Retrieves all routines
 *
 * Note: strictly only the routine data, no days or any other sub-objects
 */
export function useActiveRoutineQuery() {
    return useQuery({
        queryKey: [QueryKey.ROUTINES_ACTIVE],
        queryFn: getActiveRoutine
    });
}


export const useAddRoutineQuery = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: AddRoutineParams) => addRoutine(data),
        onSuccess: () => queryClient.invalidateQueries(
            { queryKey: [QueryKey.ROUTINE_OVERVIEW,] }
        )
    });
};


export const useEditRoutineQuery = (id: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: EditRoutineParams) => editRoutine(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QueryKey.ROUTINE_OVERVIEW,] });
            queryClient.invalidateQueries({ queryKey: [QueryKey.ROUTINE_DETAIL, id] });
        }
    });
};

