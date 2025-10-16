import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Routine } from "components/WorkoutRoutines/models/Routine";
import {
    addRoutine,
    deleteRoutine,
    editRoutine,
    getActiveRoutine,
    getPrivateTemplatesShallow,
    getPublicTemplatesShallow,
    getRoutine,
    getRoutineLogData,
    getRoutines,
    getRoutinesShallow,
    getRoutineStatisticsData
} from "services";
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

export function useRoutineLogData(id: number) {
    return useQuery({
        queryKey: [QueryKey.ROUTINE_LOG_DATA, id],
        queryFn: () => getRoutineLogData(id)
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
        mutationFn: (routine: Routine) => addRoutine(routine),
        onSuccess: () => queryClient.invalidateQueries(
            { queryKey: [QueryKey.ROUTINE_OVERVIEW] }
        ),
    });
};


export const useEditRoutineQuery = (routineId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (routine: Routine) => editRoutine(routine),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QueryKey.ROUTINE_OVERVIEW] });
            queryClient.invalidateQueries({ queryKey: [QueryKey.ROUTINE_DETAIL, routineId] });
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

