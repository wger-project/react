import axios from 'axios';
import { Exercise } from "components/Exercises/models/exercise";
import { Day } from "components/WorkoutRoutines/models/Day";
import { RoutineStatsData, RoutineStatsDataAdapter } from "components/WorkoutRoutines/models/LogStats";
import { Routine } from "components/WorkoutRoutines/models/Routine";
import { RoutineDayData } from "components/WorkoutRoutines/models/RoutineDayData";
import { RoutineLogData, RoutineLogDataAdapter } from "components/WorkoutRoutines/models/RoutineLogData";
import { getExercise } from "services/exercise";
import { getRoutineRepUnits, getRoutineWeightUnits } from "services/workoutUnits";
import { ApiPath } from "utils/consts";
import { makeHeader, makeUrl } from "utils/url";
import { ResponseType } from "./responseType";

export const ROUTINE_API_STRUCTURE_PATH = 'structure';
export const ROUTINE_API_LOGS_PATH = 'logs';
export const ROUTINE_API_STATS_PATH = 'stats';
export const ROUTINE_API_ALL_ITERATION_DISPLAY = 'date-sequence-display';


/*
 * Processes a routine with all sub-objects
 */
const exerciseMap: { [id: number]: Exercise } = {};

export const processRoutine = async (id: number): Promise<Routine> => {

    const response = await axios.get(
        makeUrl(ApiPath.ROUTINE, { id: id }),
        { headers: makeHeader() }
    );
    const routine = Routine.fromJson(response.data);

    const responses = await Promise.all([
        getRoutineRepUnits(),
        getRoutineWeightUnits(),
        getRoutineDayDataAllIterations(id),
        getRoutineStructure(id),

    ]);
    const repsUnits = responses[0];
    const weightUnits = responses[1];
    const dayDataAllIterations = responses[2];
    const dayStructure = responses[3];


    // Collect all unique exercise IDs and load the data in bulk
    const exerciseIds = new Set<number>();
    for (const dayData of dayDataAllIterations.filter(d => d.day !== null && d.iteration === 1)) {
        for (const slotData of dayData.slots) {
            for (const setData of slotData.setConfigs) {
                exerciseIds.add(setData.exerciseId);
            }
        }
    }
    const exercisePromises = Array.from(exerciseIds).map(id => getExercise(id));
    const exercises = await Promise.all(exercisePromises);
    exercises.forEach(exercise => {
        exerciseMap[exercise.id!] = exercise;
    });

    // Collect and load all exercises for the workout
    for (const dayData of dayDataAllIterations) {
        for (const slotData of dayData.slots) {
            for (const setData of slotData.setConfigs) {
                setData.exercise = exerciseMap[setData.exerciseId];
                if (setData.repetitionsUnitId !== null) {
                    setData.repetitionsUnit = repsUnits.find(r => r.id === setData.repetitionsUnitId) ?? null;
                }

                if (setData.weightUnitId !== null) {
                    setData.weightUnit = weightUnits.find(w => w.id === setData.weightUnitId) ?? null;
                }
            }

            for (const exerciseId of slotData.exerciseIds) {
                slotData.exercises?.push(exerciseMap[exerciseId]);
            }
        }
    }

    for (const day of dayStructure) {
        for (const slot of day.slots) {
            for (const slotEntry of slot.entries) {
                slotEntry.exercise = exerciseMap[slotEntry.exerciseId];

                if (slotEntry.repetitionUnitId !== null) {
                    slotEntry.repetitionUnit = repsUnits.find(r => r.id === slotEntry.repetitionUnitId) ?? null;
                }

                if (slotEntry.weightUnitId !== null) {
                    slotEntry.weightUnit = weightUnits.find(w => w.id === slotEntry.weightUnitId) ?? null;
                }
            }
        }
    }

    routine.dayData = dayDataAllIterations;
    routine.days = dayStructure;

    return routine;
};


/*
 * Retrieves all routines
 *
 * Note: this returns all the data, including all sub-objects
 */
export const getRoutines = async (): Promise<Routine[]> => {
    const url = makeUrl(ApiPath.ROUTINE, { query: { 'is_public': false } });
    const response = await axios.get<ResponseType<Routine>>(
        url,
        { headers: makeHeader() }
    );

    const out: Routine[] = [];
    for (const routineData of response.data.results) {
        out.push(await processRoutine(routineData.id!));
    }
    return out;
};

/*
 * Returns the current active routine
 *
 * Note that at the moment this is simply the newest one
 */
export const getActiveRoutine = async (): Promise<null | Routine> => {
    const url = makeUrl(ApiPath.ROUTINE, { query: { 'limit': '1', 'is_template': false } });

    const response = await axios.get<ResponseType<Routine>>(
        url,
        { headers: makeHeader() }
    );

    if (response.data.count === 0) {
        return null;
    }

    return await processRoutine(response.data.results[0].id!);
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
    const url = makeUrl(ApiPath.ROUTINE, { query: { 'is_public': false } });
    const response = await axios.get<ResponseType<Routine>>(
        url,
        { headers: makeHeader() }
    );

    return response.data.results.map(routineData => Routine.fromJson(routineData)).filter(routine => routine.isNotTemplate);
};

export const getPrivateTemplatesShallow = async (): Promise<Routine[]> => {
    const url = makeUrl(ApiPath.PRIVATE_TEMPLATE);
    const response = await axios.get<ResponseType<Routine>>(
        url,
        { headers: makeHeader() }
    );

    return response.data.results.map(routineData => Routine.fromJson(routineData));
};

export const getPublicTemplatesShallow = async (): Promise<Routine[]> => {
    const url = makeUrl(ApiPath.PUBLIC_TEMPLATE);
    const response = await axios.get<ResponseType<Routine>>(
        url,
        { headers: makeHeader() }
    );

    return response.data.results.map(routineData => Routine.fromJson(routineData));
};

export const addRoutine = async (routine: Routine): Promise<Routine> => {
    const response = await axios.post(
        makeUrl(ApiPath.ROUTINE,),
        routine.toJson(),
        { headers: makeHeader() }
    );

    return Routine.fromJson(response.data);
};

export const editRoutine = async (routine: Routine): Promise<Routine> => {
    const response = await axios.patch(
        makeUrl(ApiPath.ROUTINE, { id: routine.id! }),
        routine.toJson(),
        { headers: makeHeader() }
    );

    return Routine.fromJson(response.data);
};

export const deleteRoutine = async (id: number): Promise<number> => {
    const response = await axios.delete(
        makeUrl(ApiPath.ROUTINE, { id: id }),
        { headers: makeHeader() }
    );

    return response.status;
};


export const getRoutineDayDataAllIterations = async (routineId: number): Promise<RoutineDayData[]> => {
    const response = await axios.get(
        makeUrl(ApiPath.ROUTINE, { id: routineId, objectMethod: ROUTINE_API_ALL_ITERATION_DISPLAY }),
        { headers: makeHeader() }
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return response.data.map((data: any) => RoutineDayData.fromJson(data));
};

export const getRoutineStructure = async (routineId: number): Promise<Day[]> => {
    const response = await axios.get(
        makeUrl(ApiPath.ROUTINE, { id: routineId, objectMethod: ROUTINE_API_STRUCTURE_PATH }),
        { headers: makeHeader() }
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return response.data.days.map((data: any) => Day.fromJson(data));
};

export const getRoutineLogData = async (routineId: number): Promise<RoutineLogData[]> => {
    const response = await axios.get(
        makeUrl(ApiPath.ROUTINE, { id: routineId, objectMethod: ROUTINE_API_LOGS_PATH }),
        { headers: makeHeader() }
    );

    const adapter = new RoutineLogDataAdapter();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return response.data.map((data: any) => adapter.fromJson(data));
};

export const getRoutineStatisticsData = async (routineId: number): Promise<RoutineStatsData> => {
    const response = await axios.get(
        makeUrl(ApiPath.ROUTINE, { id: routineId, objectMethod: ROUTINE_API_STATS_PATH }),
        { headers: makeHeader() }
    );

    return new RoutineStatsDataAdapter().fromJson(response.data);
};
