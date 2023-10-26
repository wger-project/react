import axios from 'axios';
import { ExerciseTranslation, ExerciseTranslationAdapter } from "components/Exercises/models/exerciseTranslation";
import { ENGLISH_LANGUAGE_CODE, LANGUAGE_SHORT_ENGLISH } from "utils/consts";
import { makeHeader, makeUrl } from "utils/url";
import { ExerciseSearchResponse, ExerciseSearchType, ResponseType } from "./responseType";

export const EXERCISE_PATH = 'exercise';
export const EXERCISE_TRANSLATION_PATH = 'exercise-translation';
export const EXERCISE_SEARCH_PATH = 'exercise/search';


/*
 * Fetch all exercise translations for a given exercise base
 */
export const getExerciseTranslations = async (id: number): Promise<ExerciseTranslation[]> => {
    // eslint-disable-next-line camelcase
    const url = makeUrl(EXERCISE_PATH, { query: { exercise_base: id } });
    const { data } = await axios.get<ResponseType<any>>(url, {
        headers: makeHeader(),
    });
    const adapter = new ExerciseTranslationAdapter();
    return data.results.map(e => adapter.fromJson(e));
};


/*
 * Fetch all exercise translations for a given exercise base
 */
export const searchExerciseTranslations = async (name: string, languageCode: string = ENGLISH_LANGUAGE_CODE, searchEnglish: boolean = true,): Promise<ExerciseSearchResponse[]> => {
    const languages = [languageCode];
    if (languageCode !== LANGUAGE_SHORT_ENGLISH && searchEnglish) {
        languages.push(LANGUAGE_SHORT_ENGLISH);
    }


    const url = makeUrl(EXERCISE_SEARCH_PATH, { query: { term: name, language: languages.join(',') } });

    const { data } = await axios.get<ExerciseSearchType>(url);
    return data.suggestions;
};


/*
 * Create a new exercise translation
 */
export const addExerciseTranslation = async (
    exerciseBaseId: number,
    languageId: number,
    name: string,
    description: string,
    author: string
): Promise<ExerciseTranslation> => {

    const url = makeUrl(EXERCISE_TRANSLATION_PATH);
    const baseData = {
        // eslint-disable-next-line camelcase
        exercise_base: exerciseBaseId,
        language: languageId,
        name: name,
        description: description,
        // eslint-disable-next-line camelcase
        license_author: author
    };
    const response = await axios.post(url, baseData, {
        headers: makeHeader(),
    });

    const adapter = new ExerciseTranslationAdapter();
    return adapter.fromJson(response.data);
};

/*
 * Edit an existing exercise translation
 */
export const editExerciseTranslation = async (
    id: number,
    exerciseBaseId: number,
    languageId: number,
    name: string,
    description: string,
): Promise<ExerciseTranslation> => {
    const url = makeUrl(EXERCISE_TRANSLATION_PATH, { id: id });
    const baseData = {
        // eslint-disable-next-line camelcase
        exercise_base: exerciseBaseId,
        language: languageId,
        name: name,
        description: description,
    };
    const response = await axios.patch(
        url,
        baseData,
        { headers: makeHeader() }
    );

    const adapter = new ExerciseTranslationAdapter();
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