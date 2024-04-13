import { Exercise } from "components/Exercises/models/exercise";
import { WorkoutLog, WorkoutLogAdapter } from "components/WorkoutRoutines/models/WorkoutLog";
import { getExercise } from "services/exercise";
import { getRepUnits, getWeightUnits } from "services/workoutUnits";
import { API_MAX_PAGE_SIZE } from "utils/consts";
import { fetchPaginated } from "utils/requests";
import { makeUrl } from "utils/url";

export const WORKOUT_LOG_API_PATH = 'workoutlog';

/*
 * Retrieves the training logs for a routine
 */
export const getRoutineLogs = async (id: number, loadExercises = false): Promise<WorkoutLog[]> => {
    const adapter = new WorkoutLogAdapter();
    const url = makeUrl(
        WORKOUT_LOG_API_PATH,
        { query: { workout: id.toString(), limit: API_MAX_PAGE_SIZE, ordering: '-date' } }
    );

    const unitResponses = await Promise.all([getRepUnits(), getWeightUnits()]);
    const repUnits = unitResponses[0];
    const weightUnits = unitResponses[1];

    const exercises: Map<number, Exercise> = new Map();

    const out: WorkoutLog[] = [];
    for await (const page of fetchPaginated(url)) {
        for (const logData of page) {
            const log = adapter.fromJson(logData);
            log.repetitionUnitObj = repUnits.find(e => e.id === log.repetitionUnit);
            log.weightUnitObj = weightUnits.find(e => e.id === log.weightUnit);

            // Load the base object
            if (loadExercises) {
                if (exercises.get(log.exerciseId) === undefined) {
                    exercises.set(log.exerciseId, await getExercise(log.exerciseId));
                }
                log.exerciseObj = exercises.get(log.exerciseId)!;
            }

            out.push(log);
        }
    }

    return out;
};