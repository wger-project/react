import axios from 'axios';
import { Exercise, ExerciseAdapter } from "components/Exercises/models/exercise";
import { makeHeader, makeUrl } from "utils/url";
import { ResponseType } from "./responseType";

export const EXERCISE_INFO_PATH = 'exerciseinfo';
export const EXERCISE_PATH = 'exercise';
export const EXERCISE_SUBMISSION_PATH = 'exercise-submission';

/*
 * Process the response from the server and return the exercise bases
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    comment: string
}
type TranslationSubmissionProps = {
    name: string,
    description: string,
    language: number,
    aliases?: AliasSubmissionProps[],
    comments?: NotesSubmissionProps[]
}

export type AddExerciseFullProps = {
    author?: string,
    exercise: ExerciseSubmissionProps,
    variations?: number | null,
    variationsConnectTo?: number | null,
    translations: TranslationSubmissionProps[],
}

export const addFullExercise = async (data: AddExerciseFullProps): Promise<number> => {

    const url = makeUrl(EXERCISE_SUBMISSION_PATH);
    const payload = {
        category: data.exercise.categoryId,
        equipment: data.exercise.equipmentIds,
        muscles: data.exercise.muscleIds,
        "muscles_secondary": data.exercise.secondaryMuscleIds,
        "license_author": data.author ?? '',
        variations: data.variations ?? null,
        "variations_connect_to": data.variationsConnectTo ?? null,
        translations: [
            ...data.translations.map(t => ({
                    name: t.name,
                    "description_source": t.description,
                    language: t.language,
                    "license_author": data.author ?? '',
                    aliases: t.aliases ?? [],
                    comments: t.comments ?? []
                })
            )
        ],
    };

    const result = await axios.post(
        url,
        payload,
        { headers: makeHeader() }
    );
    return result.data.id;
};

/*
 * Update an existing exercise
 */
type EditExerciseProps = {
    category?: number,
    equipment?: number[],
    muscles?: number[],
    muscles_secondary?: number[],
    variations?: number | null,
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