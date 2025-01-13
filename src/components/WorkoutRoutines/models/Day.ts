/* eslint-disable camelcase */

import { Slot, SlotAdapter } from "components/WorkoutRoutines/models/Slot";
import i18n from 'i18next';
import { Adapter } from "utils/Adapter";

interface DayParams {
    id: number;
    order: number;
    name: string;
    description: string;
    isRest: boolean;
    needLogsToAdvance: boolean;
    type: 'custom' | 'enom' | 'amrap' | 'hiit' | 'tabata' | 'edt' | 'rft' | 'afap';
    config: any | null;
    slots?: Slot[];
}

export class Day {

    id: number;
    order: number;
    name: string;
    description: string;
    isRest: boolean;
    needLogsToAdvance: boolean;
    type: 'custom' | 'enom' | 'amrap' | 'hiit' | 'tabata' | 'edt' | 'rft' | 'afap';
    config: any | null;

    slots: Slot[] = [];

    constructor({
                    id,
                    order,
                    name,
                    description,
                    isRest,
                    needLogsToAdvance,
                    type,
                    config,
                    slots = []
                }: DayParams) {
        this.id = id;
        this.order = order;
        this.name = name;
        this.description = description;
        this.isRest = isRest;
        this.needLogsToAdvance = needLogsToAdvance;
        this.type = type;
        this.config = config;
        this.slots = slots;
    }

    public get isSpecialType(): boolean {
        return this.type !== 'custom';
    }

    public getDisplayName(): string {
        return this.isRest ? i18n.t('routines.restDay') : this.name;
    }

}


export class DayAdapter implements Adapter<Day> {
    fromJson = (item: any): Day => new Day({
        id: item.id,
        order: item.order,
        name: item.name,
        description: item.description,
        isRest: item.is_rest,
        needLogsToAdvance: item.need_logs_to_advance,
        type: item.type,
        config: item.config,
        slots: item.hasOwnProperty('slots') ? item.slots.map((slot: any) => new SlotAdapter().fromJson(slot)) : [],
    });

    toJson = (item: Day) => ({
        order: item.order,
        description: item.description,
        is_rest: item.isRest,
        need_logs_to_advance: item.needLogsToAdvance,
        type: item.type,
        config: item.config,
    });
}
