import axios from 'axios';
import { Exercise, ExerciseAdapter } from "components/Exercises/models/exercise";
import { Translation, TranslationAdapter } from "components/Exercises/models/translation";
import { ENGLISH_LANGUAGE_CODE, LANGUAGE_SHORT_ENGLISH } from "utils/consts";
import { makeHeader, makeUrl } from "utils/url";
import { ResponseType } from "./responseType";

export const EXERCISE_PATH = 'exercise';
export const EXERCISE_TRANSLATION_PATH = 'exercise-translation';


/*
 * Fetch all exercise translations for a given exercise base
 */
export const getExerciseTranslations = async (id: number): Promise<Translation[]> => {
    const url = makeUrl(EXERCISE_PATH, { query: { exercise: id } });
    const { data } = await axios.get<ResponseType<Translation>>(url, {
        headers: makeHeader(),
    });
    const adapter = new TranslationAdapter();
    return data.results.map(e => adapter.fromJson(e));
};


/*
 * Search for exercises by name using the exerciseinfo endpoint
 */
export const searchExerciseTranslations = async (name: string, languageCode: string = ENGLISH_LANGUAGE_CODE, searchEnglish: boolean = true): Promise<Exercise[]> => {
    const languages = [languageCode];
    if (languageCode !== LANGUAGE_SHORT_ENGLISH && searchEnglish) {
        languages.push(LANGUAGE_SHORT_ENGLISH);
    }

    const url = makeUrl('exerciseinfo', {
        query: {
            "name__search": name,
            "language__code": languages.join(','),
            limit: 50,
        }
    });

    try {
        const { data } = await axios.get<ResponseType<Exercise>>(url, {
            headers: makeHeader(),
        });

        if (!data || !data.results || !Array.isArray(data.results)) {
            return [];
        }

        const adapter = new ExerciseAdapter();
        return data.results.map((item: unknown) => adapter.fromJson(item));
    } catch {
        return [];
    }
};


/*
 * Create a new exercise translation
 */
export interface AddTranslationParams {
    exerciseId: number;
    languageId: number;
    name: string;
    description: string;
    author: string;
}

export const addTranslation = async (params: AddTranslationParams): Promise<Translation> => {
    const { exerciseId, languageId, name, description, author } = params;

    const url = makeUrl(EXERCISE_TRANSLATION_PATH);
    const baseData = {
        exercise: exerciseId,
        language: languageId,
        name: name,
        description: description,
        // eslint-disable-next-line camelcase
        license_author: author
    };
    const response = await axios.post(url, baseData, {
        headers: makeHeader(),
    });

    const adapter = new TranslationAdapter();
    return adapter.fromJson(response.data);
};

/*
 * Edit an existing exercise translation
 */
export interface EditTranslationParams extends AddTranslationParams {
    id: number;
}

export const editTranslation = async (data: EditTranslationParams): Promise<Translation> => {
    const { id, exerciseId, languageId, name, description } = data;

    const url = makeUrl(EXERCISE_TRANSLATION_PATH, { id: id });
    const baseData = {
        exercise: exerciseId,
        language: languageId,
        name: name,
        description: description,
    };
    const response = await axios.patch(
        url,
        baseData,
        { headers: makeHeader() }
    );

    const adapter = new TranslationAdapter();
    return adapter.fromJson(response.data);
};

/*
 * Delete an existing exercise translation
 */
export const deleteExerciseTranslation = async (id: number): Promise<number> => {
    const url = makeUrl(EXERCISE_TRANSLATION_PATH, { id: id });
    const response = await axios.delete(
        url,
        { headers: makeHeader() }
    );

    return response.status;
};
