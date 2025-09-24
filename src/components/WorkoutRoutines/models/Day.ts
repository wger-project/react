/* eslint-disable camelcase */

import { Slot, SlotAdapter } from "components/WorkoutRoutines/models/Slot";
import i18n from 'i18next';
import { Adapter } from "utils/Adapter";

interface DayConstructorParams {
    id?: number;
    routineId: number;
    order: number;
    name: string;
    description?: string;
    isRest?: boolean;
    needLogsToAdvance?: boolean;
    type?: 'custom' | 'enom' | 'amrap' | 'hiit' | 'tabata' | 'edt' | 'rft' | 'afap';
    config?: any | null;
    slots?: Slot[];
}

export class Day {

    id: number | null = null;
    routineId: number;
    order: number;
    name: string;
    description: string;
    isRest: boolean;
    needLogsToAdvance: boolean;
    type: 'custom' | 'enom' | 'amrap' | 'hiit' | 'tabata' | 'edt' | 'rft' | 'afap';
    config: any | null;

    slots: Slot[] = [];

    constructor(data: DayConstructorParams) {
        this.id = data.id ?? null;
        this.routineId = data.routineId ?? null;
        this.order = data.order;
        this.name = data.name;
        this.description = data.description ?? '';
        this.isRest = data.isRest ?? false;
        this.needLogsToAdvance = data.needLogsToAdvance ?? false;
        this.type = data.type ?? 'custom';
        this.config = data.config ?? null;
        this.slots = data.slots ?? [];
    }

    public get isSpecialType(): boolean {
        return this.type !== 'custom';
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static fromJson(json: any): Day {
        return adapter.fromJson(json);
    }

    static clone(other: Day, overrides?: Partial<DayConstructorParams>): Day {
        return new Day({
            id: overrides?.id ?? (other.id ?? undefined),
            routineId: overrides?.routineId ?? other.routineId,
            order: overrides?.order ?? other.order,
            name: overrides?.name ?? other.name,
            description: overrides?.description ?? other.description,
            isRest: overrides?.isRest ?? other.isRest,
            needLogsToAdvance: overrides?.needLogsToAdvance ?? other.needLogsToAdvance,
            type: overrides?.type ?? other.type,
            config: overrides?.config ?? other.config,
            slots: overrides?.slots ?? other.slots,
        });
    }

    public getDisplayName(): string {
        return this.isRest ? i18n.t('routines.restDay') : this.name;
    }

    toJson() {
        return adapter.toJson(this);
    }

}

export const getDayName = (day: Day | null): string => day === null || day.isRest ? i18n.t('routines.restDay') : day.getDisplayName();


class DayAdapter implements Adapter<Day> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fromJson = (item: any): Day => new Day({
        id: item.id,
        routineId: item.routine,
        order: item.order,
        name: item.name,
        description: item.description,
        isRest: item.is_rest,
        needLogsToAdvance: item.need_logs_to_advance,
        type: item.type,
        config: item.config,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        slots: Object.hasOwn(item, 'slots') ? item.slots.map((slot: any) => new SlotAdapter().fromJson(slot)) : [],
    });

    toJson = (item: Day) => ({
        routine: item.routineId,
        name: item.name,
        order: item.order,
        description: item.description,
        is_rest: item.isRest,
        need_logs_to_advance: item.needLogsToAdvance,
        type: item.type,
    });
}

const adapter = new DayAdapter();