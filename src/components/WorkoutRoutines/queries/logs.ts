import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { WorkoutLog } from "components/WorkoutRoutines/models/WorkoutLog";
import { addLogs, deleteLog, editLog, getRoutineLogs } from "services";
import { QueryKey } from "utils/consts";

export function useDeleteRoutineLogQuery(routineId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (logId: number) => deleteLog(logId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QueryKey.ROUTINE_LOG_DATA, routineId] });
            queryClient.invalidateQueries({ queryKey: [QueryKey.ROUTINE_STATS, routineId] });
        }
    });
}


export function useRoutineLogQuery(id: number, loadExercises: boolean = false, filter: object = {}) {
    return useQuery({
        queryKey: [QueryKey.ROUTINE_LOGS, id],
        queryFn: () => getRoutineLogs(id, { loadExercises: loadExercises, filtersetQuery: filter })
    });
}

export function useEditRoutineLogQuery(routineId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (log: WorkoutLog) => editLog(log),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QueryKey.ROUTINE_LOGS, routineId] });
            queryClient.invalidateQueries({ queryKey: [QueryKey.ROUTINE_STATS, routineId] });
        }
    });
}

export function useAddRoutineLogsQuery(routineId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mutationFn: (entries: any[]) => addLogs(entries),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QueryKey.ROUTINE_LOGS, routineId] });
            queryClient.invalidateQueries({ queryKey: [QueryKey.ROUTINE_STATS, routineId] });
        }
    });
}
