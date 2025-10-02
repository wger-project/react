/* eslint-disable camelcase */

import { Slot } from "components/WorkoutRoutines/models/Slot";
import i18n from 'i18next';
import { Adapter } from "utils/Adapter";

export type DayType = 'custom' | 'enom' | 'amrap' | 'hiit' | 'tabata' | 'edt' | 'rft' | 'afap';

interface DayConstructorParams {
    id?: number;
    routineId: number | null;
    order: number;
    name: string;
    description?: string;
    isRest?: boolean;
    needLogsToAdvance?: boolean;
    type?: DayType;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    config?: any | null;
    slots?: Slot[];
}

export class Day {

    id: number | null = null;
    // Note that this can only be null when loading the data from dayData. Perhaps we should include
    // it there as well? Otherwise we just have to be a bit careful when editing regular day
    // objects in forms or so
    routineId: number | null = null;
    order: number;
    name: string;
    description: string;
    isRest: boolean;
    needLogsToAdvance: boolean;
    type: DayType;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        slots: Object.hasOwn(item, 'slots') ? item.slots.map((slot: any) => Slot.fromJson(slot)) : [],
    });

    toJson = (item: Day) => ({
        routine: item.routineId,
        name: item.name,
        order: item.order,
        description: item.description,
        is_rest: item.isRest,
        need_logs_to_advance: item.needLogsToAdvance,
        type: item.type,
        config: item.config,
    });
}

const adapter = new DayAdapter();