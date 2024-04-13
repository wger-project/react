import { Day } from "components/WorkoutRoutines/models/Day";
import { WorkoutLog } from "components/WorkoutRoutines/models/WorkoutLog";
import { Adapter } from "utils/Adapter";

export class WorkoutSession {

    logs: WorkoutLog[] = [];

    constructor(
        public id: number,
        public dayId: number,
        public date: Date,
        public notes: String,
        public impression: String,
        public timeStart: Date,
        public timeEnd: Date,
        public dayObj?: Day,
    ) {
        if (dayObj) {
            this.dayObj = dayObj;
        }
    }
}


export class WorkoutSessionAdapter implements Adapter<WorkoutSession> {
    fromJson(item: any) {
        return new WorkoutSession(
            item.id,
            item.day,
            item.date,
            item.notes,
            item.impression,
            item.time_start,
            item.time_end,
        );
    }

    toJson(item: WorkoutSession):
        any {
        return {
            id: item.id,
            day: item.dayId,
            notes: item.notes,
            impression: item.impression,
            // eslint-disable-next-line camelcase
            time_start: item.timeStart,
            // eslint-disable-next-line camelcase
            time_end: item.timeEnd,
        };
    }
}