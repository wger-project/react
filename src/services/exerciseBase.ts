import axios from 'axios';
import { ResponseType } from "./responseType";
import { makeHeader, makeUrl } from "utils/url";
import { ExerciseBase, ExerciseBaseAdapter } from "components/Exercises/models/exerciseBase";
import { ExerciseTranslationAdapter } from "components/Exercises/models/exerciseTranslation";

export const EXERCISE_INFO_PATH = 'exercisebaseinfo';


/*
 * Fetch all exercise bases
 */
export const getExerciseBases = async (): Promise<ExerciseBase[]> => {
    const url = makeUrl(EXERCISE_INFO_PATH, { query: { limit: 300 } });
    const { data } = await axios.get<ResponseType<any>>(url, {
        headers: makeHeader(),
    });
    const adapter = new ExerciseBaseAdapter();
    const translationAdapter = new ExerciseTranslationAdapter();

    const out: ExerciseBase[] = [];
    for (const exerciseBase of data.results) {
        try {
            const exerciseBaseObj = adapter.fromJson(exerciseBase);
            for (const e of exerciseBase.exercises) {
                exerciseBaseObj.translations.push(translationAdapter.fromJson(e));
            }
            out.push(exerciseBaseObj);
        } catch (e) {
            console.error("Could not load exercise translations, skipping...", e);
        }
    }

    return out;
};

