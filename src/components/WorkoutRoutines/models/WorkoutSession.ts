import { Day } from "components/WorkoutRoutines/models/Day";
import { WorkoutLog } from "components/WorkoutRoutines/models/WorkoutLog";
import i18n from 'i18next';
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

interface WorkoutSessionParams {
    id: number;
    dayId: number;
    routineId: number;
    date: Date;
    notes: string | null;
    impression: string;
    timeStart: Date | null;
    timeEnd: Date | null;
    dayObj?: Day;
    logs?: WorkoutLog[];
}

export class WorkoutSession {

    id: number;
    dayId: number;
    routineId: number;
    date: Date;
    notes: string | null;
    impression: string;
    timeStart: Date | null;
    timeEnd: Date | null;
    dayObj?: Day;
    logs: WorkoutLog[] = [];

    constructor(params: WorkoutSessionParams) {
        this.id = params.id;
        this.dayId = params.dayId;
        this.routineId = params.routineId;
        this.date = params.date;
        this.notes = params.notes;
        this.impression = params.impression;
        this.timeStart = params.timeStart;
        this.timeEnd = params.timeEnd;
        if (params.dayObj) {
            this.dayObj = params.dayObj;
        }
        this.logs = params.logs ?? [];
    }

    // get the impression as a translated string
    get impressionString(): string {
        switch (this.impression) {
            case IMPRESSION_BAD:
                return i18n.t('routines.impressionBad');
            case IMPRESSION_NEUTRAL:
                return i18n.t('routines.impressionNeutral');
            case IMPRESSION_GOOD:
                return i18n.t('routines.impressionGood');
            default:
                return "";
        }
    }

    get textRepresentation(): string {
        const time = this.timeStart && this.timeEnd ? `${this.timeStart.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        })} - ${this.timeEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} /` : "";

        const notes = this.notes ?? "";


        return `${this.impressionString} ${time} ${notes}`;
    }
}


export class WorkoutSessionAdapter implements Adapter<WorkoutSession> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fromJson = (item: any) => new WorkoutSession({
        id: item.id,
        dayId: item.day!,
        routineId: item.routine!,
        date: new Date(item.date!),
        notes: item.notes !== undefined ? item.notes : null,
        impression: item.impression!,
        timeStart: item.time_start !== undefined ? HHMMToDateTime(item.time_start) : null,
        timeEnd: item.time_end !== undefined ? HHMMToDateTime(item.time_end) : null,
        dayObj: item.dayObj,
        logs: item.logs
    });


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