import { useQuery } from "@tanstack/react-query";
import { getRoutineLogs } from "services";
import { QueryKey } from "utils/consts";

export function useRoutineLogQuery(id: number, loadExercises = false) {
    return useQuery([QueryKey.ROUTINE_LOGS, id, loadExercises],
        () => getRoutineLogs(id, loadExercises)
    );
}