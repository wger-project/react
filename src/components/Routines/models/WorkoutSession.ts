import { Day } from "@/components/Routines/models/Day";
import { WorkoutLog } from "@/components/Routines/models/WorkoutLog";
import i18n from 'i18next';
import { Adapter } from "@/core/lib/Adapter";

export const NOTES_MAX_LENGTH = 1000 as const;

export const IMPRESSION_BAD = '1' as const;
export const IMPRESSION_NEUTRAL = '2' as const;
export const IMPRESSION_GOOD = '3' as const;

interface WorkoutSessionParams {
    id: string | null;
    dayId: number;
    routineId: number;
    datetimeStart: Date;
    datetimeEnd: Date | null;
    notes: string | null;
    impression: string;
    dayObj?: Day;
    logs?: WorkoutLog[];
}

export class WorkoutSession {

    id: string | null;
    dayId: number;
    routineId: number;
    datetimeStart: Date;
    datetimeEnd: Date | null;
    notes: string | null;
    impression: string;
    dayObj?: Day;
    logs: WorkoutLog[] = [];

    constructor(params: WorkoutSessionParams) {
        this.id = params.id;
        this.dayId = params.dayId;
        this.routineId = params.routineId;
        this.datetimeStart = params.datetimeStart;
        this.datetimeEnd = params.datetimeEnd;
        this.notes = params.notes;
        this.impression = params.impression;
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

    toJson() {
        return new WorkoutSessionAdapter().toJson(this);
    }

    get textRepresentation(): string {
        const format = (date: Date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const time = this.datetimeEnd
            ? `${format(this.datetimeStart)} - ${format(this.datetimeEnd)} /`
            : `${format(this.datetimeStart)} /`;

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
        datetimeStart: new Date(item.datetime_start),
        datetimeEnd: item.datetime_end ? new Date(item.datetime_end) : null,
        notes: item.notes !== undefined ? item.notes : null,
        impression: item.impression!,
        dayObj: item.dayObj,
        logs: item.logs
    });


    toJson = (item: WorkoutSession) => ({
        ...(item.id != null ? { id: item.id } : {}),
        day: item.dayId,
        routine: item.routineId,
        notes: item.notes,
        impression: item.impression,
        // eslint-disable-next-line camelcase
        datetime_start: item.datetimeStart.toISOString(),
        // eslint-disable-next-line camelcase
        datetime_end: item.datetimeEnd ? item.datetimeEnd.toISOString() : null,
    });
}
