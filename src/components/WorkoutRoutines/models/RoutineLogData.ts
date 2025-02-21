/* eslint-disable camelcase */

import { WorkoutLog, WorkoutLogAdapter } from "components/WorkoutRoutines/models/WorkoutLog";
import { WorkoutSession, WorkoutSessionAdapter } from "components/WorkoutRoutines/models/WorkoutSession";
import { Adapter } from "utils/Adapter";

export class RoutineLogData {

    constructor(
        public session: WorkoutSession,
        public logs: WorkoutLog[],
    ) {
    }
}


export class RoutineLogDataAdapter implements Adapter<RoutineLogData> {
    fromJson = (item: any) => new RoutineLogData(
        new WorkoutSessionAdapter().fromJson(item.session),
        item.logs.map((log: any) => new WorkoutLogAdapter().fromJson(log)),
    );
}