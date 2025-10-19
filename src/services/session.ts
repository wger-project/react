import axios from 'axios';
import { Exercise } from "components/Exercises/models/exercise";
import { WorkoutLog, WorkoutLogAdapter } from "components/WorkoutRoutines/models/WorkoutLog";
import {
    AddSessionParams,
    EditSessionParams,
    WorkoutSession,
    WorkoutSessionAdapter
} from "components/WorkoutRoutines/models/WorkoutSession";
import { getExercise } from "services";
import { API_MAX_PAGE_SIZE, ApiPath } from "utils/consts";
import { fetchPaginated } from "utils/requests";
import { makeHeader, makeUrl } from "utils/url";

export type SessionQueryOptions = {
    filtersetQuerySessions?: object,
    filtersetQueryLogs?: object,
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

export const getSessions = async (options?: SessionQueryOptions): Promise<WorkoutSession[]> => {

    const { filtersetQuerySessions = {}, filtersetQueryLogs = {} } = options || {};

    const sessionAdapter = new WorkoutSessionAdapter();
    const logAdapter = new WorkoutLogAdapter();
    const result: WorkoutSession[] = [];
    const logs: WorkoutLog[] = [];
    const exercises: Record<number, Exercise> = {};

    // Fetch all logs first
    for await (const logPage of fetchPaginated(
        makeUrl(
            ApiPath.WORKOUT_LOG,
            { query: { limit: API_MAX_PAGE_SIZE, ...filtersetQueryLogs } }
        ),
        makeHeader()
    )) {
        for (const logData of logPage) {
            logs.push(logAdapter.fromJson(logData));
        }
    }

    // Fetch all exercises and associate them with logs if it's not known
    for (const log of logs) {
        if (!exercises[log.exerciseId]) {
            exercises[log.exerciseId] = await getExercise(log.exerciseId);
        }
        log.exerciseObj = exercises[log.exerciseId];
    }

    for await (const sessionPage of fetchPaginated(
        makeUrl(
            ApiPath.SESSION,
            { query: { limit: API_MAX_PAGE_SIZE, ...filtersetQuerySessions } }
        ), makeHeader()
    )) {
        for (const sessionData of sessionPage) {
            const session = sessionAdapter.fromJson(sessionData);
            session.logs = logs.filter(log => log.sessionId === session.id);
            result.push(session);
        }
    }

    return result;
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
