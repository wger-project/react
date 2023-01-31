import axios from 'axios';
import { ResponseType } from "./responseType";
import { makeHeader, makeUrl } from "utils/url";
import { WorkoutRoutine, WorkoutRoutineAdapter } from "components/WorkoutRoutines/models/WorkoutRoutine";
import { Day, DayAdapter } from "components/WorkoutRoutines/models/Day";
import { SetAdapter, WorkoutSet } from "components/WorkoutRoutines/models/WorkoutSet";
import { SettingAdapter, WorkoutSetting } from "components/WorkoutRoutines/models/WorkoutSetting";

export const WORKOUT_API_PATH = 'workout';
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
 * Processes a workout routine with all sub-object
 */
export const processWorkoutRoutine = async (routineData: any): Promise<WorkoutRoutine> => {
    const routineAdapter = new WorkoutRoutineAdapter();
    const dayAdapter = new DayAdapter();
    const setAdapter = new SetAdapter();
    const settingAdapter = new SettingAdapter();

    const routine = routineAdapter.fromJson(routineData);

    // Process the days
    const dayResponse = await axios.get<ResponseType<Day>>(
        makeUrl(DAY_API_PATH, { query: { training: routine.id.toString() } }),
        { headers: makeHeader() },
    );
    for (const dayData of dayResponse.data.results) {
        const day = dayAdapter.fromJson(dayData);

        // Process the sets
        const setResponse = await axios.get<ResponseType<WorkoutSet>>(
            makeUrl(SET_API_PATH, { query: { exerciseday: day.id.toString() } }),
            { headers: makeHeader() },
        );
        for (const setData of setResponse.data.results) {
            const set = setAdapter.fromJson(setData);

            // Process the settings
            const settingResponse = await axios.get<ResponseType<WorkoutSetting>>(
                makeUrl(SET_API_PATH, { query: { set: set.id.toString() } }),
                { headers: makeHeader() },
            );
            for (const settingData of settingResponse.data.results) {
                const setting = settingAdapter.fromJson(settingData);

                set.settings.push(setting);
            }

            day.sets.push(set);
        }

        routine.days.push(day);
    }

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
        out.push(await processWorkoutRoutine(routineData));
    }
    return out;
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
