import axios from 'axios';
import { ApiMuscleType } from 'types';
import { ResponseType } from "./responseType";
import { makeHeader, makeUrl } from "utils/url";
import { Muscle, MuscleAdapter } from "components/Exercises/models/muscle";

export const MUSCLES_PATH = 'muscle';

/*
 * Fetch all muscles
 */
export const getMuscles = async (): Promise<Muscle[]> => {
    const url = makeUrl(MUSCLES_PATH);
    const { data: receivedMuscles } = await axios.get<ResponseType<ApiMuscleType>>(url, {
        headers: makeHeader(),
    });
    const adapter = new MuscleAdapter();
    return receivedMuscles.results.map(m => adapter.fromJson(m));
};
