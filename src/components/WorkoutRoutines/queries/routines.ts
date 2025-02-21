import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    addRoutine,
    deleteRoutine,
    editRoutine,
    getActiveRoutine,
    getPrivateTemplatesShallow,
    getPublicTemplatesShallow,
    getRoutine,
    getRoutines,
    getRoutinesShallow,
    getRoutineStatisticsData
} from "services";
import { AddRoutineParams, EditRoutineParams } from "services/routine";
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

export function useRoutineStatsQuery(id: number) {
    return useQuery({
        queryKey: [QueryKey.ROUTINE_STATS, id],
        queryFn: () => getRoutineStatisticsData(id)
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

export function usePrivateRoutinesShallowQuery() {
    return useQuery({
        queryKey: [QueryKey.PRIVATE_TEMPLATES],
        queryFn: getPrivateTemplatesShallow
    });
}

export function usePublicRoutinesShallowQuery() {
    return useQuery({
        queryKey: [QueryKey.PUBLIC_TEMPLATES],
        queryFn: getPublicTemplatesShallow
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
            { queryKey: [QueryKey.ROUTINE_OVERVIEW] }
        ),
    });
};


export const useEditRoutineQuery = (id: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: EditRoutineParams) => editRoutine(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QueryKey.ROUTINE_OVERVIEW] });
            queryClient.invalidateQueries({ queryKey: [QueryKey.ROUTINE_DETAIL, id] });
        }
    });
};

export const useDeleteRoutineQuery = (id: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => deleteRoutine(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QueryKey.ROUTINE_OVERVIEW] });
            queryClient.invalidateQueries({ queryKey: [QueryKey.ROUTINE_DETAIL, id] });
        }
    });
};

