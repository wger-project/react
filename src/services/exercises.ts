import axios from 'axios';
import { ResponseType } from "./responseType";
import { makeHeader, makeUrl } from "utils/url";
import { ExerciseAdapter, ExerciseTranslation } from "components/Exercises/models/exerciseTranslation";

export const EXERCISE_INFO_PATH = 'exercise';


/*
 * Fetch all exercises
 */
export const getExercises = async (): Promise<ExerciseTranslation[]> => {
    const url = makeUrl(EXERCISE_INFO_PATH);
    const { data: data } = await axios.get<ResponseType<any>>(url, {
        headers: makeHeader(),
    });
    const adapter = new ExerciseAdapter();
    return data.results.map(e => adapter.fromJson(e));
};
