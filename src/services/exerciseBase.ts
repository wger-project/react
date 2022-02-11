import axios from 'axios';
import { ResponseType } from "./responseType";
import { makeHeader, makeUrl } from "utils/url";
import { ExerciseBase, ExerciseBaseAdapter } from "components/Exercises/models/exerciseBase";
import { getExerciseTranslations } from "services/exerciseTranslation";

export const EXERCISE_INFO_PATH = 'exerciseinfo';


/*
 * Fetch all exercise bases
 */
export const getExerciseBases = async (): Promise<ExerciseBase[]> => {
    const url = makeUrl(EXERCISE_INFO_PATH, { query: { limit: 30 } });
    const { data: data } = await axios.get<ResponseType<any>>(url, {
        headers: makeHeader(),
    });
    const adapter = new ExerciseBaseAdapter();
    const out: ExerciseBase[] = [];


    for (const exerciseBase of data.results) {
        try {
            const exerciseBaseObj = adapter.fromJson(exerciseBase);
            const translations = await getExerciseTranslations(exerciseBaseObj.id);
            exerciseBaseObj.translations = translations;
            out.push(exerciseBaseObj);
        } catch (e) {
            console.error("Could not load exercise translations, skipping...", e);
        }
    }


    return out;
};

