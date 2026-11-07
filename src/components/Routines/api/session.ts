import { attachExercises } from "@/components/Routines/api/workoutLogs";
import { WorkoutLogAdapter } from "@/components/Routines/models/WorkoutLog";
import { WorkoutSession, WorkoutSessionAdapter } from "@/components/Routines/models/WorkoutSession";
import { ApiPath } from "@/core/lib/consts";
import { fetchAll } from "@/core/lib/requests";
import { makeHeader, makeUrl } from "@/core/lib/url";
import axios from 'axios';

export type SessionQueryOptions = {
    filtersetQuerySessions?: object,
    filtersetQueryLogs?: object,
}

/*
 * Look up sessions, e.g. the ones of a single day
 *
 * A day can hold several sessions, so this returns all of them in the order the
 * server sends them, by start time.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const searchSessions = async (queryParams: Record<string, any>): Promise<WorkoutSession[]> => {
    const response = await axios.get(
        makeUrl(ApiPath.SESSION, { query: queryParams }),
        { headers: makeHeader() }
    );

    const adapter = new WorkoutSessionAdapter();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return response.data.results.map((session: any) => adapter.fromJson(session));
};

export const getSessions = async (options?: SessionQueryOptions): Promise<WorkoutSession[]> => {

    const { filtersetQuerySessions = {}, filtersetQueryLogs = {} } = options || {};

    const sessionAdapter = new WorkoutSessionAdapter();
    const logAdapter = new WorkoutLogAdapter();

    // Fetch all logs first
    const logs = await fetchAll(
        makeUrl(ApiPath.WORKOUT_LOG, { query: filtersetQueryLogs }),
        json => logAdapter.fromJson(json)
    );

    await attachExercises(logs);

    return await fetchAll(
        makeUrl(ApiPath.SESSION, { query: filtersetQuerySessions }),
        json => {
            const session = sessionAdapter.fromJson(json);
            session.logs = logs.filter(log => log.sessionId === session.id);
            return session;
        }
    );
};

export const addSession = async (session: WorkoutSession): Promise<WorkoutSession> => {
    const response = await axios.post(
        makeUrl(ApiPath.SESSION,),
        session.toJson(),
        { headers: makeHeader() }
    );

    return new WorkoutSessionAdapter().fromJson(response.data);
};

/*
 * Delete a session. The server deletes the logs that belong to it as well.
 */
export const deleteSession = async (id: string): Promise<number> => {
    const response = await axios.delete(
        makeUrl(ApiPath.SESSION, { id: id }),
        { headers: makeHeader() }
    );

    return response.status;
};

export const editSession = async (session: WorkoutSession): Promise<WorkoutSession> => {
    const response = await axios.patch(
        makeUrl(ApiPath.SESSION, { id: session.id! }),
        session.toJson(),
        { headers: makeHeader() }
    );

    return new WorkoutSessionAdapter().fromJson(response.data);
};
