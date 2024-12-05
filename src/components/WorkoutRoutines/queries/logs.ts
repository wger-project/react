import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addLogs, getRoutineLogs } from "services";
import { QueryKey } from "utils/consts";

export function useRoutineLogQuery(id: number, loadExercises = false) {
    return useQuery({
        queryKey: [QueryKey.ROUTINE_LOGS, id, loadExercises],
        queryFn: () => getRoutineLogs(id, loadExercises)
    });
}

export function useAddRoutineLogsQuery(routineId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (entries: any[]) => addLogs(entries),
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: [QueryKey.ROUTINE_LOGS, routineId]
        })
    });
}
