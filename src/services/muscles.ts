import axios from 'axios';
import { Muscle, MuscleAdapter } from "components/Exercises/models/muscle";
import { ApiMuscleType } from 'types';
import { makeHeader, makeUrl } from "utils/url";
import { ResponseType } from "./responseType";

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

