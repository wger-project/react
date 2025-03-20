import axios from 'axios';
import {
    AddSessionParams,
    EditSessionParams,
    WorkoutSession,
    WorkoutSessionAdapter
} from "components/WorkoutRoutines/models/WorkoutSession";
import { ApiPath } from "utils/consts";
import { makeHeader, makeUrl } from "utils/url";


export const searchSession = async (queryParams: Record<string, any>): Promise<WorkoutSession | null> => {
    const response = await axios.get(
        makeUrl(ApiPath.SESSION, { query: queryParams }),
        { headers: makeHeader() }
    );

    if (response.data.count === 1) {
        return new WorkoutSessionAdapter().fromJson(response.data.results[0]);
    }

    return null;
};

export const addSession = async (data: AddSessionParams): Promise<WorkoutSession> => {
    const response = await axios.post(
        makeUrl(ApiPath.SESSION,),
        data,
        { headers: makeHeader() }
    );

    return new WorkoutSessionAdapter().fromJson(response.data);
};

export const editSession = async (data: EditSessionParams): Promise<WorkoutSession> => {
    const response = await axios.patch(
        makeUrl(ApiPath.SESSION, { id: data.id }),
        data,
        { headers: makeHeader() }
    );

    return new WorkoutSessionAdapter().fromJson(response.data);
};
