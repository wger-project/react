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


/*
 * Fetch exercise base with a particular ID
 */
export const getExerciseBase = async (id: number): Promise<ExerciseBase> => {
    const url = makeUrl(EXERCISE_INFO_PATH, { id: id });
    const { data: data } = await axios.get<ResponseType<any>>(url, {
        headers: makeHeader(),
    });

    const adapter = new ExerciseBaseAdapter();
    const translationAdapter = new ExerciseTranslationAdapter();

    // assign data to this any variable so that I can access exercises on line 64
    const exerciseBase: any = data;

    // adapt the received object to be used, by filtering out some props and adding others
    const exerciseBaseObj: ExerciseBase = adapter.fromJson(exerciseBase);

    try {
        // send the different translations to translation adapter
        exerciseBaseObj.translations.push(translationAdapter.fromJson(exerciseBase.exercises[0]));
    } catch (e) {
        console.error("Could not load exercise translations, skipping...", e);
    }

    return exerciseBaseObj;
};


/*
 * Fetch exercise bases with a given variation ID
 */
export const getExerciseBasesForVariation = async (id: number | null | undefined): Promise<ExerciseBase[]> => {
    if (!id) {
        return [];
    }

    const url = makeUrl(EXERCISE_INFO_PATH, { query: { variations: id } });
    const { data: data } = await axios.get<ResponseType<any>>(url, {
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