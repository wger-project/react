import { useQuery } from "@tanstack/react-query";
import { QUERY_ROUTINE_DETAIL, QUERY_ROUTINES, QUERY_ROUTINES_SHALLOW, } from "utils/consts";
import { getWorkoutRoutine, getWorkoutRoutines, getWorkoutRoutinesShallow, } from "services";


export function useRoutinesQuery() {
    return useQuery([QUERY_ROUTINES], getWorkoutRoutines);
}

export function useRoutineDetailQuery(id: number) {
    return useQuery([QUERY_ROUTINE_DETAIL, id],
        () => getWorkoutRoutine(id)
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
