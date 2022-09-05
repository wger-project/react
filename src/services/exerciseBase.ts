import axios from 'axios';
import { ResponseType } from "./responseType";
import { makeHeader, makeUrl } from "utils/url";
import { ExerciseBase, ExerciseBaseAdapter } from "components/Exercises/models/exerciseBase";

export const EXERCISE_INFO_PATH = 'exercisebaseinfo';
export const EXERCISE_BASE_PATH = 'exercise-base';

/*
 * Process the response from the server and return the exercise bases
 */
export function processBaseData(data: any): ExerciseBase[] {
    const adapter = new ExerciseBaseAdapter();

    const out: ExerciseBase[] = [];
    for (const baseData of data.results) {
        out.push(adapter.fromJson(baseData));
    }
    return out;
}


/*
 * Fetch all exercise bases
 */
export const getExerciseBases = async (): Promise<ExerciseBase[]> => {
    const url = makeUrl(EXERCISE_INFO_PATH, { query: { limit: 900 } });
    const response = await axios.get<ResponseType<any>>(url, {
        headers: makeHeader(),
    });

    return processBaseData(response.data);
};


/*
 * Fetch exercise base with a particular ID
 */
export const getExerciseBase = async (id: number): Promise<ExerciseBase> => {
    const adapter = new ExerciseBaseAdapter();
    const url = makeUrl(EXERCISE_INFO_PATH, { id: id });
    const response = await axios.get<ResponseType<any>>(url, {
        headers: makeHeader(),
    });

    return adapter.fromJson(response.data);
};


/*
 * Fetch exercise bases with a given variation ID
 */
export const getExerciseBasesForVariation = async (id: number | null | undefined): Promise<ExerciseBase[]> => {
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
export const addExerciseBase = async (categoryId: number,
                                      equipmentIds: number[],
                                      muscleIds: number[],
                                      secondaryMuscleIds: number[],
                                      variationId: number | null,
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
export const editExerciseBase = async (id: number,
                                       categoryId: number,
                                       equipmentIds: number[],
                                       muscleIds: number[],
                                       secondaryMuscleIds: number[],
                                       variationId: number | null,
): Promise<number> => {

    const url = makeUrl(EXERCISE_BASE_PATH, { id: id });
    const baseData = {
        category: categoryId,
        equipment: equipmentIds,
        muscles: muscleIds,
        // eslint-disable-next-line camelcase
        muscles_secondary: secondaryMuscleIds,
        // eslint-disable-next-line camelcase
        variation_id: variationId,
    };
    const response = await axios.patch(
        url,
        baseData,
        { headers: makeHeader() }
    );

    return response.data.id;
};