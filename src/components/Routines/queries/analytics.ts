import { getWorkoutLogs } from "@/components/Routines/api/workoutLogs";
import { AnalyticsDateFilter } from "@/components/Routines/models/analytics";
import { QueryKey } from "@/core/lib/consts";
import { useQuery } from "@tanstack/react-query";

export const useExerciseAnalyticsQuery = (filter: AnalyticsDateFilter) => useQuery({
    queryKey: [QueryKey.EXERCISE_ANALYTICS, filter],
    queryFn: () => getWorkoutLogs({ loadExercises: true, filtersetQuery: filter }),
});
