/* eslint-disable camelcase */

import { Slot, SlotAdapter } from "components/WorkoutRoutines/models/Slot";
import i18n from 'i18next';
import { Adapter } from "utils/Adapter";

export class Day {

    slots: Slot[] = [];

    constructor(
        public id: number,
        public order: number,
        public name: string,
        public description: string,
        public isRest: boolean,
        public needLogsToAdvance: boolean,
        public type: 'custom' | 'enom' | 'amrap' | 'hiit' | 'tabata' | 'edt' | 'rft' | 'afap',
        public config: any | null,
        slots?: Slot[]
    ) {
        if (slots) {
            this.slots = slots;
        }
    }

    public get isSpecialType(): boolean {
        return this.type !== 'custom';
    }

    public getDisplayName(): string {
        return this.isRest ? i18n.t('routines.restDay') : this.name;
    }

}


export class DayAdapter implements Adapter<Day> {
    fromJson = (item: any): Day => new Day(
        item.id,
        item.order,
        item.name,
        item.description,
        item.is_rest,
        item.need_logs_to_advance,
        item.type,
        item.config,
        item.hasOwnProperty('slots') ? item.slots.map((slot: any) => new SlotAdapter().fromJson(slot)) : [],
    );

    toJson = (item: Day) => ({
        order: item.order,
        description: item.description,
        is_rest: item.isRest,
        need_logs_to_advance: item.needLogsToAdvance,
        type: item.type,
        config: item.config,
    });
}
