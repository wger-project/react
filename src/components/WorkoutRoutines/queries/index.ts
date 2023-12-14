import { useQuery } from "@tanstack/react-query";
import { QUERY_ROUTINE_DETAIL, QUERY_ROUTINE_LOGS, QUERY_ROUTINES, QUERY_ROUTINES_SHALLOW, } from "utils/consts";
import { getWorkoutRoutine, getWorkoutRoutines, getWorkoutRoutinesShallow, } from "services";
import { getRoutineLogs } from "services/workoutRoutine";


export function useRoutinesQuery() {
    return useQuery([QUERY_ROUTINES], getWorkoutRoutines);
}

export function useRoutineDetailQuery(id: number) {
    return useQuery([QUERY_ROUTINE_DETAIL, id],
        () => getWorkoutRoutine(id)
    );
}

export function useRoutineLogQuery(id: number, loadBases = false) {
    return useQuery([QUERY_ROUTINE_LOGS, id, loadBases],
        () => getRoutineLogs(id, loadBases)
    );
}

/*
 * Retrieves all workout routines
 *
 * Note: strictly only the routine data, no days or any other sub-objects
 */
export function useRoutinesShallowQuery() {
    return useQuery([QUERY_ROUTINES_SHALLOW], getWorkoutRoutinesShallow);
}
