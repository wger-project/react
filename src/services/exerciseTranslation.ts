import axios from 'axios';
import { ResponseType } from "./responseType";
import { makeHeader, makeUrl } from "utils/url";
import { ExerciseTranslation, ExerciseTranslationAdapter } from "components/Exercises/models/exerciseTranslation";

export const EXERCISE_PATH = 'exercise';


/*
 * Fetch all exercise translations for a given exercise base
 */
export const getExerciseTranslations = async (id: number): Promise<ExerciseTranslation[]> => {
    const url = makeUrl(EXERCISE_PATH, { query: { exercise_base: id } });
    const { data: data } = await axios.get<ResponseType<any>>(url, {
        headers: makeHeader(),
    });
    const adapter = new ExerciseTranslationAdapter();
    return data.results.map(e => adapter.fromJson(e));
};
