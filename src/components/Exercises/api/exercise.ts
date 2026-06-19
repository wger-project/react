import { Exercise, ExerciseAdapter } from "@/components/Exercises/models/exercise";
import { ResponseType } from "@/core/api/responseType";
import { fetchPaginated } from "@/core/lib/requests";
import { makeHeader, makeUrl } from "@/core/lib/url";
import axios from 'axios';

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
    const url = makeUrl(EXERCISE_INFO_PATH, { query: { limit: 300 } });
    const out: Exercise[] = [];
    for await (const page of fetchPaginated(url, makeHeader())) {
        out.push(...processExerciseApiData({ results: page }));
    }

    return out;
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
 * Fetch several exercises by ID in a single request.
 *
 * Unknown or stale IDs are simply absent from the result instead of making the
 * whole call fail, which keeps a routine, log or plan loadable.
 */
export const getExercisesByIds = async (ids: number[]): Promise<Exercise[]> => {

    // An empty id__in would be ignored by the API and return everything, so bail out early
    if (ids.length === 0) {
        return [];
    }

    const url = makeUrl(EXERCISE_INFO_PATH, { query: { id__in: ids.join(',') } });
    const out: Exercise[] = [];
    for await (const page of fetchPaginated(url, makeHeader())) {
        out.push(...processExerciseApiData({ results: page }));
    }

    return out;
};


/*
 * Fetch exercises that belong to the same variation group
 */
export const getExercisesForVariation = async (id: string | null | undefined): Promise<Exercise[]> => {
    if (!id) {
        return [];
    }

    const url = makeUrl(EXERCISE_INFO_PATH, { query: { variation_group: id } });
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
    variationGroup?: string | null,
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
        "variation_group": data.variationGroup ?? null,
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
export type EditExerciseProps = {
    category?: number,
    equipment?: number[],
    muscles?: number[],
    muscles_secondary?: number[],
    variation_group?: string | null,
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
export type DeleteExerciseOptions = {
    replacementUUID?: string;
    transferMedia?: boolean;
    transferTranslations?: boolean;
};

export const deleteExercise = async (
    id: number,
    options: DeleteExerciseOptions = {}
): Promise<number> => {
    let params: Parameters<typeof makeUrl>[1];
    if (options.replacementUUID === undefined) {
        params = { id };
    } else {
        const query: Record<string, string> = { "replaced_by": options.replacementUUID };
        if (options.transferMedia) {
            query["transfer_media"] = '1';
        }
        if (options.transferTranslations) {
            query["transfer_translations"] = '1';
        }
        params = { id, query };
    }

    const url = makeUrl(EXERCISE_PATH, params);
    const response = await axios.delete(
        url,
        { headers: makeHeader() }
    );

    return response.status;
};