import axios from 'axios';
import { ResponseType } from "./responseType";
import { makeHeader, makeUrl } from "utils/url";
import { ExerciseBase, ExerciseBaseAdapter } from "components/Exercises/models/exerciseBase";

export const EXERCISE_INFO_PATH = 'exerciseinfo';


/*
 * Fetch all exercise bases
 */
export const getExerciseBases = async (): Promise<ExerciseBase[]> => {
    const url = makeUrl(EXERCISE_INFO_PATH, { query: { limit: 50 } });
    const { data: data } = await axios.get<ResponseType<any>>(url, {
        headers: makeHeader(),
    });
    const adapter = new ExerciseBaseAdapter();
    return data.results.map(e => adapter.fromJson(e));
};
