/* eslint-disable camelcase */

import { Slot, SlotAdapter } from "components/WorkoutRoutines/models/Slot";
import { Adapter } from "utils/Adapter";

export class Day {

    slots: Slot[] = [];

    constructor(
        public id: number,
        public nextDayId: number | null,
        public name: string,
        public description: string,
        public isRest: boolean,
        public needLogsToAdvance: boolean,
        public lastDayInWeek: boolean,
        public type: 'custom' | 'enom' | 'amrap' | 'hiit' | 'tabata' | 'edt' | 'rft' | 'afap',
        slots?: Slot[]
    ) {
        if (slots) {
            this.slots = slots;
        }
    }

    public get isSpecialType(): boolean {
        return this.type !== 'custom';
    }
}


export class DayAdapter implements Adapter<Day> {
    fromJson = (item: any): Day => new Day(
        item.id,
        item.next_day,
        item.name,
        item.description,
        item.is_rest,
        item.need_logs_to_advance,
        item.need_logs_to_advance,
        item.type,
        item.hasOwnProperty('slots') ? item.slots.map((slot: any) => new SlotAdapter().fromJson(slot)) : [],
    );

    toJson = (item: Day) => ({
        next_day: item.nextDayId,
        description: item.description,
        is_rest: item.isRest,
        need_logs_to_advance: item.needLogsToAdvance,
        last_day_in_week: item.lastDayInWeek,
        type: item.type,
    });
}
