import { WorkoutLog, WorkoutLogAdapter } from "@/components/Routines/models/WorkoutLog";
import { WorkoutSession, WorkoutSessionAdapter } from "@/components/Routines/models/WorkoutSession";
import { Adapter } from "@/core/lib/Adapter";

export class RoutineLogData {

    constructor(
        public session: WorkoutSession,
        public logs: WorkoutLog[],
    ) {
    }
}


export class RoutineLogDataAdapter implements Adapter<RoutineLogData> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fromJson = (item: any) => new RoutineLogData(
        new WorkoutSessionAdapter().fromJson(item.session),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        item.logs.map((log: any) => new WorkoutLogAdapter().fromJson(log)),
    );
}