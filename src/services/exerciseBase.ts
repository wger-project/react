import axios from 'axios';
import { ResponseType } from "./responseType";
import { makeHeader, makeUrl } from "utils/url";
import { ExerciseBase, ExerciseBaseAdapter } from "components/Exercises/models/exerciseBase";
import { ExerciseTranslationAdapter } from "components/Exercises/models/exerciseTranslation";
import { ENGLISH_LANGUAGE_ID } from "utils/consts";

export const EXERCISE_INFO_PATH = 'exercisebaseinfo';
export const EXERCISE_BASE_PATH = 'exercise-base';

/*
 * Process the response from the server and return the exercise bases
 */
export function processBaseData(data: any): ExerciseBase[] {

    const out: ExerciseBase[] = [];
    for (const exerciseBase of data.results) {
        out.push(processBaseDataSingle(exerciseBase));
    }
    return out;
}

/*
 * Process the response from the server and return a single exercise base
 */
export function processBaseDataSingle(data: any): ExerciseBase {
    const translationAdapter = new ExerciseTranslationAdapter();
    const exerciseBaseObj = new ExerciseBaseAdapter().fromJson(data);

    try {
        for (const e of data.exercises) {
            exerciseBaseObj.translations.push(translationAdapter.fromJson(e));
        }

        if (!exerciseBaseObj.translations.some(t => t.language === ENGLISH_LANGUAGE_ID)) {
            console.info(`No english translation found for exercise base ${exerciseBaseObj.uuid}!`);
        }

        if (exerciseBaseObj.translations.length === 0) {
            console.error(`No translations found for exercise base ${exerciseBaseObj.uuid}!`);
        }

    } catch (e) {
        console.error("Error loading exercise base data!", e);
    }

    return exerciseBaseObj;
}

/*
 * Fetch all exercise bases
 */
export const getExerciseBases = async (): Promise<ExerciseBase[]> => {
    const url = makeUrl(EXERCISE_INFO_PATH, { query: { limit: 300 } });
    const response = await axios.get<ResponseType<any>>(url, {
        headers: makeHeader(),
    });

    return processBaseData(response.data);
};


/*
 * Fetch exercise base with a particular ID
 */
export const getExerciseBase = async (id: number): Promise<ExerciseBase> => {
    const url = makeUrl(EXERCISE_INFO_PATH, { id: id });
    const response = await axios.get<ResponseType<any>>(url, {
        headers: makeHeader(),
    });

    return processBaseDataSingle(response.data);
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