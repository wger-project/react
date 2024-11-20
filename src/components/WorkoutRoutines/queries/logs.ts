import { useQuery } from "@tanstack/react-query";
import { getRoutineLogs } from "services";
import { QueryKey } from "utils/consts";

export function useRoutineLogQuery(id: number, loadExercises = false) {
    return useQuery({
        queryKey: [QueryKey.ROUTINE_LOGS, id, loadExercises],
        queryFn: () => getRoutineLogs(id, loadExercises)
    });
}
