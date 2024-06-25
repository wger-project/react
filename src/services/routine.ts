import axios from 'axios';
import { Day, DayAdapter } from "components/WorkoutRoutines/models/Day";
import { Routine, RoutineAdapter } from "components/WorkoutRoutines/models/Routine";
import { RoutineDayData, RoutineDayDataAdapter } from "components/WorkoutRoutines/models/RoutineDayData";
import { getExercise } from "services/exercise";
import { getRepUnits, getWeightUnits } from "services/workoutUnits";
import { makeHeader, makeUrl } from "utils/url";
import { ResponseType } from "./responseType";

export const ROUTINE_API_PATH = 'routine';
export const ROUTINE_API_DAY_SEQUENCE_PATH = 'day-sequence';
export const ROUTINE_API_STRUCTURE_PATH = 'structure';
export const ROUTINE_API_CURRENT_ITERATION_DISPLAY = 'current-iteration-display-mode';
export const SET_API_PATH = 'set';
export const SETTING_API_PATH = 'setting';

/*
 * Processes a routine with all sub-object
 */
export const processRoutineShallow = (routineData: any): Routine => {
    const routineAdapter = new RoutineAdapter();
    return routineAdapter.fromJson(routineData);
};

/*
 * Processes a routine with all sub-objects
 */
export const processRoutine = async (id: number): Promise<Routine> => {
    const routineAdapter = new RoutineAdapter();
    // const dayAdapter = new DayAdapter();
    // const setAdapter = new SetAdapter();
    // const settingAdapter = new SettingAdapter();

    const response = await axios.get(
        makeUrl(ROUTINE_API_PATH, { id: id }),
        { headers: makeHeader() }
    );
    const routine = routineAdapter.fromJson(response.data);

    const responses = await Promise.all([
        getRepUnits(),
        getWeightUnits(),
        getRoutineDayDataCurrentIteration(id),
        getRoutineStructure(id),
    ]);
    const repUnits = responses[0];
    const weightUnits = responses[1];
    const dayDataCurrentIteration = responses[2];
    const dayStructure = responses[3];

    console.log(dayStructure);


    const exerciseMap: { [id: number]: any } = {};

    // Collect and load all exercises for the workout
    for (const day of dayDataCurrentIteration) {
        for (const slot of day.slots) {
            for (const exerciseId of slot.exerciseIds) {
                if (!(exerciseId in exerciseMap)) {
                    exerciseMap[exerciseId] = await getExercise(exerciseId);
                }
            }
        }
    }
    for (const dayData of dayDataCurrentIteration) {
        for (const slot of dayData.slots) {
            for (const setData of slot.setConfigs) {
                setData.exercise = exerciseMap[setData.exerciseId];
            }

            for (const exerciseId of slot.exerciseIds) {
                slot.exercises?.push(exerciseMap[exerciseId]);
            }
        }
    }
    routine.dayDataCurrentIteration = dayDataCurrentIteration;

    // Process the days
    // const daysResponse = await axios.get<ResponseType<Day>>(
    //     makeUrl(ROUTINE_API_PATH, {
    //         id: routine.id,
    //         objectMethod: ROUTINE_API_DAY_SEQUENCE_PATH
    //     }),
    //     { headers: makeHeader() },
    // );


    // for (const dayData of dayResponse.data.results) {
    //     const day = dayAdapter.fromJson(dayData);
    //
    //     // Process the sets
    //     const setResponse = await axios.get<ResponseType<WorkoutSet>>(
    //         makeUrl(SET_API_PATH, { query: { exerciseday: day.id.toString() } }),
    //         { headers: makeHeader() },
    //     );
    //     for (const setData of setResponse.data.results) {
    //         const set = setAdapter.fromJson(setData);
    //         day.slots.push(set);
    //     }
    //
    //     // Process the settings
    //     const settingPromises = setResponse.data.results.map((setData: any) => {
    //         return axios.get<ResponseType<any>>(
    //             makeUrl(SETTING_API_PATH, { query: { set: setData.id } }),
    //             { headers: makeHeader() },
    //         );
    //     });
    //     const settingsResponses = await Promise.all(settingPromises);
    //
    //     for (const settingsData of settingsResponses) {
    //         for (const settingData of settingsData.data.results) {
    //             const set = day.slots.find(e => e.id === settingData.set);
    //             const setting = settingAdapter.fromJson(settingData);
    //
    //             // TODO: use some global state or cache for this
    //             //       we will need to access individual exercises throughout the app
    //             //       as well as the weight and repetition units
    //             const weightUnit = weightUnits.find(e => e.id === setting.weightUnit);
    //             const repUnit = repUnits.find(e => e.id === setting.repetitionUnit);
    //
    //             const tmpSetting = set!.settings.find(e => e.exerciseId === setting.exerciseId);
    //             setting.base = tmpSetting !== undefined ? tmpSetting.base : await getExercise(setting.exerciseId);
    //             setting.weightUnitObj = weightUnit;
    //             setting.repetitionUnitObj = repUnit;
    //
    //             set!.settings.push(setting);
    //         }
    //     }
    //     routine.days.push(day);
    // }

    return routine;
};


/*
 * Retrieves all routines
 *
 * Note: this returns all the data, including all sub-objects
 */
export const getRoutines = async (): Promise<Routine[]> => {
    const url = makeUrl(ROUTINE_API_PATH);
    const response = await axios.get<ResponseType<Routine>>(
        url,
        { headers: makeHeader() }
    );

    const out: Routine[] = [];
    for (const routineData of response.data.results) {
        out.push(await processRoutine(routineData.id));
    }
    return out;
};

/*
 * Returns the current active routine
 *
 * Note that at the moment this is simply the newest one
 */
export const getActiveRoutine = async (): Promise<null | Routine> => {
    const url = makeUrl(ROUTINE_API_PATH, { query: { 'limit': '1' } });

    const response = await axios.get<ResponseType<Routine>>(
        url,
        { headers: makeHeader() }
    );

    if (response.data.count === 0) {
        return null;
    }

    return await processRoutine(response.data.results[0].id);
};

export const getRoutine = async (id: number): Promise<Routine> => {
    return await processRoutine(id);
};

/*
 * Retrieves all routines
 *
 * Note: strictly only the routine data, no days or any other sub-objects
 */
export const getRoutinesShallow = async (): Promise<Routine[]> => {
    const url = makeUrl(ROUTINE_API_PATH);
    const response = await axios.get<ResponseType<Routine>>(
        url,
        { headers: makeHeader() }
    );

    const out: Routine[] = [];
    for (const routineData of response.data.results) {
        out.push(await processRoutineShallow(routineData));
    }
    return out;
};

export interface AddRoutineParams {
    name: string;
    description: string;
    first_day: number | null;
    start: string;
    end: string;
}

export interface EditRoutineParams extends AddRoutineParams {
    id: number,
}

export const addRoutine = async (data: AddRoutineParams): Promise<Routine> => {
    const response = await axios.post(
        makeUrl(ROUTINE_API_PATH,),
        data,
        { headers: makeHeader() }
    );

    const adapter = new RoutineAdapter();
    return adapter.fromJson(response.data);
};

export const editRoutine = async (data: EditRoutineParams): Promise<Routine> => {
    const response = await axios.patch(
        makeUrl(ROUTINE_API_PATH, { id: data.id }),
        data,
        { headers: makeHeader() }
    );

    const adapter = new RoutineAdapter();
    return adapter.fromJson(response.data);
};

export const getRoutineDayDataCurrentIteration = async (routineId: number): Promise<RoutineDayData[]> => {
    const response = await axios.get(
        makeUrl(ROUTINE_API_PATH, { id: routineId, objectMethod: ROUTINE_API_CURRENT_ITERATION_DISPLAY }),
        { headers: makeHeader() }
    );

    const adapter = new RoutineDayDataAdapter();
    return response.data.map((data: any) => adapter.fromJson(data));
};
export const getRoutineStructure = async (routineId: number): Promise<Day[]> => {
    const response = await axios.get(
        makeUrl(ROUTINE_API_PATH, { id: routineId, objectMethod: ROUTINE_API_STRUCTURE_PATH }),
        { headers: makeHeader() }
    );

    const adapter = new DayAdapter();
    return response.data.days.map((data: any) => adapter.fromJson(data));
};