import { Day } from "components/WorkoutRoutines/models/Day";
import { WorkoutLog } from "components/WorkoutRoutines/models/WorkoutLog";
import { Adapter } from "utils/Adapter";
import { dateTimeToHHMM, dateToYYYYMMDD, HHMMToDateTime } from "utils/date";

export const NOTES_MAX_LENGTH = 1000 as const;

export const IMPRESSION_BAD = '1' as const;
export const IMPRESSION_NEUTRAL = '2' as const;
export const IMPRESSION_GOOD = '3' as const;

export interface AddSessionParams {
    day: number;
    routine: number;
    date: string;
    notes?: string;
    impression?: string;
    timeStart?: string;
    timeEnd?: string;
}

export interface EditSessionParams extends Partial<AddSessionParams> {
    id: number,
}

export class WorkoutSession {

    logs: WorkoutLog[] = [];

    constructor(
        public id: number,
        public dayId: number,
        public routineId: number,
        public date: Date,
        public notes: String | null,
        public impression: String,
        public timeStart: Date | null,
        public timeEnd: Date | null,
        public dayObj?: Day,
    ) {
        if (dayObj) {
            this.dayObj = dayObj;
        }
    }
}


export class WorkoutSessionAdapter implements Adapter<WorkoutSession> {
    fromJson = (item: any) => new WorkoutSession(
        item.id,
        item.day!,
        item.routine!,
        new Date(item.date!),
        item.notes !== undefined ? item.notes : null,
        item.impression!,
        item.time_start !== undefined ? HHMMToDateTime(item.time_start) : null,
        item.time_end !== undefined ? HHMMToDateTime(item.time_end) : null,
    );


    toJson = (item: WorkoutSession) => ({
        id: item.id,
        day: item.dayId,
        date: dateToYYYYMMDD(item.date),
        routine: item.routineId,
        notes: item.notes,
        impression: item.impression,
        // eslint-disable-next-line camelcase
        time_start: dateTimeToHHMM(item.timeStart),
        // eslint-disable-next-line camelcase
        time_end: dateTimeToHHMM(item.timeEnd),
    });
}