import axios from 'axios';
import { Exercise, ExerciseAdapter } from "components/Exercises/models/exercise";
import { Translation, TranslationAdapter } from "components/Exercises/models/translation";
import { ENGLISH_LANGUAGE_CODE, LANGUAGE_SHORT_ENGLISH } from "utils/consts";
import { makeHeader, makeUrl } from "utils/url";
import { ResponseType } from "./responseType";
import { SearchLanguageFilter } from 'components/Core/Widgets/SearchLanguageFilter';

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
export const searchExerciseTranslations = async (
    name: string,
    languageCode: string = ENGLISH_LANGUAGE_CODE,
    languageFilter: SearchLanguageFilter = "current_english",
    exactMatch: boolean = false
): Promise<Exercise[]> => {
    const languages = languageFilter === "all" ? null : [languageCode];
    if (languages && languageFilter === "current_english" && languageCode !== LANGUAGE_SHORT_ENGLISH) {
        languages.push(LANGUAGE_SHORT_ENGLISH);
    }

    try {
        if (exactMatch) {
            // Use exercise-translation endpoint for exact match
            const exactUrl = makeUrl('exercise-translation', {
                query: {
                    "name": name,
                    ...(languages ? { "language__short_name": languages.join(',') } : {}),
                    limit: 50,
                }
            });

            const { data: translationData } = await axios.get(exactUrl);

            if (!translationData?.results?.length) {
                return [];
            }

            const exerciseIds = translationData.results
                .map((t: { exercise: number }) => t.exercise)
                .join(',');

            const exerciseUrl = makeUrl('exerciseinfo', {
                query: {
                    "id__in": exerciseIds,
                    limit: 50,
                }
            });

            const { data } = await axios.get<ResponseType<Exercise>>(exerciseUrl);

            if (!data?.results?.length) {
                return [];
            }

            const adapter = new ExerciseAdapter();
            return data.results.map((item: unknown) => adapter.fromJson(item));

        } else {
            // Use exerciseinfo with name__search for fuzzy match
            const fuzzyUrl = makeUrl('exerciseinfo', {
                query: {
                    "name__search": name,
                    ...(languages ? { "language__code": languages.join(',') } : {}),
                    limit: 50,
                }
            });

            const { data } = await axios.get<ResponseType<Exercise>>(fuzzyUrl);

            if (!data?.results?.length) {
                return [];
            }

            const adapter = new ExerciseAdapter();
            return data.results.map((item: unknown) => adapter.fromJson(item));
        }
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
    author: string;
    descriptionSource: string;
}

export const addTranslation = async (params: AddTranslationParams): Promise<Translation> => {
    const { exerciseId, languageId, name, author, descriptionSource } = params;

    const url = makeUrl(EXERCISE_TRANSLATION_PATH);
    const baseData = {
        exercise: exerciseId,
        language: languageId,
        name: name,
        description_source: descriptionSource,
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
    const { id, exerciseId, languageId, name, descriptionSource } = data;

    const url = makeUrl(EXERCISE_TRANSLATION_PATH, { id: id });
    const baseData = {
        exercise: exerciseId,
        language: languageId,
        name: name,
        description_source: descriptionSource,
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