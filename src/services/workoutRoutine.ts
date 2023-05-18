import axios from 'axios';
import { ResponseType } from "./responseType";
import { makeHeader, makeUrl } from "utils/url";
import { WorkoutRoutine, WorkoutRoutineAdapter } from "components/WorkoutRoutines/models/WorkoutRoutine";
import { Day, DayAdapter } from "components/WorkoutRoutines/models/Day";
import { SetAdapter, WorkoutSet } from "components/WorkoutRoutines/models/WorkoutSet";
import { SettingAdapter } from "components/WorkoutRoutines/models/WorkoutSetting";
import { getExerciseBase } from "services/exerciseBase";
import { getRepUnits, getWeightUnits } from "services/workoutUnits";
import { WorkoutLog, WorkoutLogAdapter } from "components/WorkoutRoutines/models/WorkoutLog";
import { fetchPaginated } from "utils/requests";
import { ExerciseBase } from "components/Exercises/models/exerciseBase";

export const WORKOUT_API_PATH = 'workout';
export const WORKOUT_LOG_API_PATH = 'workoutlog';
export const DAY_API_PATH = 'day';
export const SET_API_PATH = 'set';
export const SETTING_API_PATH = 'setting';

/*
 * Processes a workout routine with all sub-object
 */
export const processRoutineShallow = (routineData: any): WorkoutRoutine => {
    const routineAdapter = new WorkoutRoutineAdapter();
    return routineAdapter.fromJson(routineData);
};

/*
 * Processes a workout routine with all sub-objects
 */
export const processWorkoutRoutine = async (id: number): Promise<WorkoutRoutine> => {
    const routineAdapter = new WorkoutRoutineAdapter();
    const dayAdapter = new DayAdapter();
    const setAdapter = new SetAdapter();
    const settingAdapter = new SettingAdapter();

    const response = await axios.get(
        makeUrl(WORKOUT_API_PATH, { id: id }),
        { headers: makeHeader() }
    );
    const routine = routineAdapter.fromJson(response.data);

    // Process the days
    const dayResponse = await axios.get<ResponseType<Day>>(
        makeUrl(DAY_API_PATH, { query: { training: routine.id.toString() } }),
        { headers: makeHeader() },
    );

    const unitResponses = await Promise.all([getRepUnits(), getWeightUnits()]);
    const repUnits = unitResponses[0];
    const weightUnits = unitResponses[1];

    for (const dayData of dayResponse.data.results) {
        const day = dayAdapter.fromJson(dayData);

        // Process the sets
        const setResponse = await axios.get<ResponseType<WorkoutSet>>(
            makeUrl(SET_API_PATH, { query: { exerciseday: day.id.toString() } }),
            { headers: makeHeader() },
        );
        for (const setData of setResponse.data.results) {
            const set = setAdapter.fromJson(setData);
            day.sets.push(set);
        }

        // Process the settings
        const settingPromises = setResponse.data.results.map((setData: any) => {
            return axios.get<ResponseType<any>>(
                makeUrl(SETTING_API_PATH, { query: { set: setData.id } }),
                { headers: makeHeader() },
            );
        });
        const settingsResponses = await Promise.all(settingPromises);

        for (const settingsData of settingsResponses) {
            for (const settingData of settingsData.data.results) {
                const set = day.sets.find(e => e.id === settingData.set);
                const setting = settingAdapter.fromJson(settingData);

                // TODO: use some global state or cache for this
                //       we will need to access individual exercises throughout the app
                //       as well as the weight and repetition units
                const weightUnit = weightUnits.find(e => e.id === setting.weightUnit);
                const repUnit = repUnits.find(e => e.id === setting.repetitionUnit);

                const tmpSetting = set!.settings.find(e => e.baseId === setting.baseId);
                setting.base = tmpSetting !== undefined ? tmpSetting.base : await getExerciseBase(setting.baseId);
                setting.weightUnitObj = weightUnit;
                setting.repetitionUnitObj = repUnit;

                set!.settings.push(setting);
            }
        }
        routine.days.push(day);
    }

    // console.log(routine);
    return routine;
};


/*
 * Retrieves all workout routines
 *
 * Note: this returns all the data, including all sub-objects
 */
export const getWorkoutRoutines = async (): Promise<WorkoutRoutine[]> => {
    const url = makeUrl(WORKOUT_API_PATH);
    const response = await axios.get<ResponseType<WorkoutRoutine>>(
        url,
        { headers: makeHeader() }
    );

    const out: WorkoutRoutine[] = [];
    for (const routineData of response.data.results) {
        out.push(await processWorkoutRoutine(routineData.id));
    }
    return out;
};
export const getWorkoutRoutine = async (id: number): Promise<WorkoutRoutine> => {
    return await processWorkoutRoutine(id);
};

/*
 * Retrieves all workout routines
 *
 * Note: strictly only the routine data, no days or any other sub-objects
 */
export const getWorkoutRoutinesShallow = async (): Promise<WorkoutRoutine[]> => {
    const url = makeUrl(WORKOUT_API_PATH);
    const response = await axios.get<ResponseType<WorkoutRoutine>>(
        url,
        { headers: makeHeader() }
    );

    const out: WorkoutRoutine[] = [];
    for (const routineData of response.data.results) {
        out.push(await processRoutineShallow(routineData));
    }
    return out;
};

/*
 * Retrieves the weight logs for a routine
 */
export const getRoutineLogs = async (id: number, loadBases = false): Promise<WorkoutLog[]> => {
    const adapter = new WorkoutLogAdapter();
    const url = makeUrl(
        WORKOUT_LOG_API_PATH,
        { query: { workout: id.toString(), limit: '999', ordering: '-date' } }
    );

    const unitResponses = await Promise.all([getRepUnits(), getWeightUnits()]);
    const repUnits = unitResponses[0];
    const weightUnits = unitResponses[1];

    const exercises: Map<number, ExerciseBase> = new Map();

    const out: WorkoutLog[] = [];
    for await  (const page of fetchPaginated(url)) {
        for (const logData of page) {
            const log = adapter.fromJson(logData);
            log.repetitionUnitObj = repUnits.find(e => e.id === log.repetitionUnit);
            log.weightUnitObj = weightUnits.find(e => e.id === log.weightUnit);

            // Load the base object
            if (loadBases) {
                if (exercises.get(log.baseId) === undefined) {
                    exercises.set(log.baseId, await getExerciseBase(log.baseId));
                }
                log.baseObj = exercises.get(log.baseId)!;
            }

            out.push(log);
        }
    }

    return out;
};
