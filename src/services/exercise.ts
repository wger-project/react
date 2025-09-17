import axios from 'axios';
import { Exercise, ExerciseAdapter } from "components/Exercises/models/exercise";
import { makeHeader, makeUrl } from "utils/url";
import { ResponseType } from "./responseType";

export const EXERCISE_INFO_PATH = 'exerciseinfo';
export const EXERCISE_PATH = 'exercise';

/*
 * Process the response from the server and return the exercise bases
 */
export function processExerciseApiData(data: any): Exercise[] {
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
export const getExercises = async (): Promise<Exercise[]> => {
    const url = makeUrl(EXERCISE_INFO_PATH, { query: { limit: 900 } });
    const response = await axios.get<ResponseType<any>>(url, {
        headers: makeHeader(),
    });

    return processExerciseApiData(response.data);
};


/*
 * Fetch exercise with a particular ID
 */
export const getExercise = async (id: number): Promise<Exercise> => {
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
export const getExercisesForVariation = async (id: number | null | undefined): Promise<Exercise[]> => {
    if (!id) {
        return [];
    }

    const url = makeUrl(EXERCISE_INFO_PATH, { query: { variations: id } });
    const response = await axios.get<ResponseType<any>>(url, {
        headers: makeHeader(),
    });

    return processExerciseApiData(response.data);
};

/*
 * Create a new exercise with all its sub-entities
 */
type ExerciseSubmissionProps = {
    categoryId: number,
    equipmentIds: number[],
    muscleIds: number[],
    secondaryMuscleIds: number[],
}
type AliasSubmissionProps = {
    alias: string
}
type NotesSubmissionProps = {
    note: string
}
type TranslationSubmissionProps = {
    name: string,
    description: string,
    language: number,
    aliases?: AliasSubmissionProps[],
    notes?: NotesSubmissionProps[]
}

export const addFullExercise = async (
    data: {
        author?: string,
        exercise: ExerciseSubmissionProps,
        variation?: number | null,
        translations: TranslationSubmissionProps[],
        images?: []

    }
): Promise<number> => {

    const url = makeUrl(EXERCISE_PATH, { objectMethod: 'submission' });

    const payload = {
        category: data.exercise.categoryId,
        equipment: data.exercise.equipmentIds,
        muscles: data.exercise.muscleIds,
        // eslint-disable-next-line camelcase
        muscles_secondary: data.exercise.secondaryMuscleIds,
        // eslint-disable-next-line camelcase
        license_author: data.author,
        translations: [
            ...data.translations.map(t => ({
                    name: t.name,
                    description: t.description,
                    language: t.language,
                    //eslint-disable-next-line camelcase
                    license_author: data.author,
                    aliases: t.aliases ?? [],
                    comments: t.notes ?? []
                })
            )
        ]
    };

    const result = await axios.post(
        url,
        payload,
        { headers: makeHeader() }
    );
    console.log(result);
    return 1;
};

/*
 * Update an existing exercise
 */
type EditExerciseProps = {
    category?: number,
    equipment?: number[],
    muscles?: number[],
    muscles_secondary?: number[],
    variation_id?: number | null,
    license_author?: string | null
}
export const editExercise = async (id: number, data: EditExerciseProps): Promise<number> => {

    const url = makeUrl(EXERCISE_PATH, { id: id });
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
export const deleteExercise = async (id: number, replacementUUID?: string): Promise<number> => {
    const params = replacementUUID === undefined
        ? { id: id }
        // eslint-disable-next-line camelcase
        : { id: id, query: { replaced_by: replacementUUID } };

    const url = makeUrl(EXERCISE_PATH, params);
    const response = await axios.delete(
        url,
        { headers: makeHeader() }
    );

    return response.status;
};