import { getExercisesByIds } from "@/components/Exercises/api/exercise";
import { Exercise } from "@/components/Exercises/models/exercise";
import { getRoutineRepUnits, getRoutineWeightUnits } from "@/components/Routines/api/workoutUnits";
import { WorkoutLog, WorkoutLogAdapter } from "@/components/Routines/models/WorkoutLog";
import { API_MAX_PAGE_SIZE, ApiPath } from "@/core/lib/consts";
import { fetchPaginated } from "@/core/lib/requests";
import { makeHeader, makeUrl } from "@/core/lib/url";
import axios from "axios";

export const deleteLog = async (id: string): Promise<number> => {
    const response = await axios.delete<number>(makeUrl(ApiPath.WORKOUT_LOG, { id: id }), {
        headers: makeHeader(),
    });

    return response.status;
};


export const editLog = async (entry: WorkoutLog): Promise<WorkoutLog> => {
    const adapter = new WorkoutLogAdapter();
    const response = await axios.patch(
        makeUrl(ApiPath.WORKOUT_LOG, { id: entry.id }),
        adapter.toJson(entry),
        { headers: makeHeader() }
    );
    return adapter.fromJson(response.data);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const addLogs = async (entries: any[]): Promise<WorkoutLog[]> => {
    const adapter = new WorkoutLogAdapter();
    const out = [] as WorkoutLog[];
    for (const entry of entries) {
        const response = await axios.post(
            makeUrl(ApiPath.WORKOUT_LOG,),
            { ...entry },
            { headers: makeHeader() }
        );
        out.push(adapter.fromJson(response.data));
    }

    return out;
};

/*
 * Retrieves the training logs for a routine
 */
export const getRoutineLogs = async (id: number, options?
: { loadExercises?: boolean, filtersetQuery?: object }): Promise<WorkoutLog[]> => {
    const { loadExercises = false, filtersetQuery = {} } = options || {};

    const adapter = new WorkoutLogAdapter();
    const url = makeUrl(
        ApiPath.WORKOUT_LOG,
        { query: { routine: id.toString(), limit: API_MAX_PAGE_SIZE, ordering: '-date', ...filtersetQuery } }
    );

    const unitResponses = await Promise.all([getRoutineRepUnits(), getRoutineWeightUnits()]);
    const repUnits = unitResponses[0];
    const weightUnits = unitResponses[1];

    const out: WorkoutLog[] = [];
    for await (const page of fetchPaginated(url)) {
        for (const logData of page) {
            const log = adapter.fromJson(logData);
            if (log.repetitionUnitId !== null) {
                log.repetitionUnitObj = repUnits.find(e => e.id === log.repetitionUnitId) ?? null;
            }

            if (log.weightUnitId !== null) {
                log.weightUnitObj = weightUnits.find(e => e.id === log.weightUnitId) ?? null;
            }

            out.push(log);
        }
    }

    // Load the referenced exercises
    if (loadExercises) {
        const exerciseIds = [...new Set(out.map(log => log.exerciseId))];
        if (exerciseIds.length > 0) {
            const exercises = new Map<number, Exercise>();
            for (const exercise of await getExercisesByIds(exerciseIds)) {
                exercises.set(exercise.id!, exercise);
            }
            for (const log of out) {
                log.exerciseObj = exercises.get(log.exerciseId);
            }
        }
    }

    return out;
};