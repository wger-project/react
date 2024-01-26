import axios from 'axios';
import { Exercise, ExerciseAdapter } from "components/Exercises/models/exercise";
import { makeHeader, makeUrl } from "utils/url";
import { ResponseType } from "./responseType";

export const EXERCISE_INFO_PATH = 'exercisebaseinfo';
export const EXERCISE_BASE_PATH = 'exercise-base';

/*
 * Process the response from the server and return the exercise bases
 */
export function processBaseData(data: any): Exercise[] {
    const adapter = new ExerciseAdapter();

    const out: Exercise[] = [];
    for (const baseData of data.results) {
        try {
            out.push(adapter.fromJson(baseData));
        } catch (e) {
            console.error('An error happened, skipping base:', e);
        }
    }
    return out;
}


/*
 * Fetch all exercise bases
 */
export const getExerciseBases = async (): Promise<Exercise[]> => {
    const url = makeUrl(EXERCISE_INFO_PATH, { query: { limit: 900 } });
    const response = await axios.get<ResponseType<any>>(url, {
        headers: makeHeader(),
    });

    return processBaseData(response.data);
};


/*
 * Fetch exercise base with a particular ID
 */
export const getExerciseBase = async (id: number): Promise<Exercise> => {
    const adapter = new ExerciseAdapter();
    const url = makeUrl(EXERCISE_INFO_PATH, { id: id });
    const response = await axios.get<ResponseType<any>>(url, {
        headers: makeHeader(),
    });

    return adapter.fromJson(response.data);
};


/*
 * Fetch exercise bases with a given variation ID
 */
export const getExerciseBasesForVariation = async (id: number | null | undefined): Promise<Exercise[]> => {
    if (!id) {
        return [];
    }

    const url = makeUrl(EXERCISE_INFO_PATH, { query: { variations: id } });
    const response = await axios.get<ResponseType<any>>(url, {
        headers: makeHeader(),
    });

    return processBaseData(response.data);
};

/*
 * Create a new exercise base
 */
export const addExerciseBase = async (
    categoryId: number,
    equipmentIds: number[],
    muscleIds: number[],
    secondaryMuscleIds: number[],
    variationId: number | null,
    author: string | null
): Promise<number> => {

    const url = makeUrl(EXERCISE_BASE_PATH);
    const baseData = {
        category: categoryId,
        equipment: equipmentIds,
        muscles: muscleIds,
        // eslint-disable-next-line camelcase
        muscles_secondary: secondaryMuscleIds,
        // eslint-disable-next-line camelcase
        variation_id: variationId,
        // eslint-disable-next-line camelcase
        license_author: author
    };
    const response = await axios.post(
        url,
        baseData,
        { headers: makeHeader() }
    );

    return response.data.id;
};

/*
 * Update an existing exercise base
 */
type editBaseProps = {
    category?: number,
    equipment?: number[],
    muscles?: number[],
    muscles_secondary?: number[],
    variation_id?: number | null,
    license_author?: string | null
}
export const editExerciseBase = async (id: number, data: editBaseProps): Promise<number> => {

    const url = makeUrl(EXERCISE_BASE_PATH, { id: id });
    const response = await axios.patch(
        url,
        data,
        { headers: makeHeader() }
    );

    return response.status;
};

/*
 * Delete an existing exercise base
 */
export const deleteExerciseBase = async (id: number, replacementUUID?: string): Promise<number> => {
    const params = replacementUUID === undefined
        ? { id: id }
        // eslint-disable-next-line camelcase
        : { id: id, query: { replaced_by: replacementUUID } };

    const url = makeUrl(EXERCISE_BASE_PATH, params);
    const response = await axios.delete(
        url,
        { headers: makeHeader() }
    );

    return response.status;
};