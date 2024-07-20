import { useQuery } from "@tanstack/react-query";
import {
    getActiveWorkoutRoutine,
    getRoutineLogs,
    getWorkoutRoutine,
    getWorkoutRoutines,
    getWorkoutRoutinesShallow
} from "services";
import {
    QUERY_ROUTINE_DETAIL,
    QUERY_ROUTINE_LOGS,
    QUERY_ROUTINES,
    QUERY_ROUTINES_ACTIVE,
    QUERY_ROUTINES_SHALLOW,
} from "utils/consts";
import { number } from "yup";


export function useRoutinesQuery() {
    return useQuery({
        queryKey: [QUERY_ROUTINES],
        ...getWorkoutRoutines
    });
}

export function useRoutineDetailQuery(id: number) {
    return useQuery({
        queryKey: [QUERY_ROUTINE_DETAIL, id],
        queryFn: () => getWorkoutRoutine(id)
    });
}

export function useRoutineLogQuery(id: number, loadBases = false) {
    return useQuery({
        queryKey: [QUERY_ROUTINE_LOGS, id, loadBases],
        queryFn: () => getRoutineLogs(id, loadBases)
    });
}

/*
 * Retrieves all workout routines
 *
 * Note: strictly only the routine data, no days or any other sub-objects
 */
export function useRoutinesShallowQuery() {
    return useQuery({
        queryKey: [QUERY_ROUTINES_SHALLOW],
        queryFn: () => getWorkoutRoutinesShallow(),
    });
}

/*
 * Retrieves all workout routines
 *
 * Note: strictly only the routine data, no days or any other sub-objects
 */
export function useActiveRoutineQuery() {
    return useQuery({
        queryKey: [QUERY_ROUTINES_ACTIVE],
        queryFn: getActiveWorkoutRoutine
    });
}
