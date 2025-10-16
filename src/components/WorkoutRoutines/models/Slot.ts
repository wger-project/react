import { SlotEntry } from "components/WorkoutRoutines/models/SlotEntry";
import { Adapter } from "utils/Adapter";

export type SlotApiData = {
    id: number,
    day: number,
    order: number,
    comment: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    config: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    entries?: any[],
}

type SlotConstructorParams = {
    id?: number;
    dayId: number;
    order?: number;
    comment?: string;
    config?: object | null;
    entries?: SlotEntry[];
};

export class Slot {

    id: number | null = null;
    dayId: number;
    order: number = 1;
    comment: string = '';
    config: object | null = null;

    entries: SlotEntry[] = [];

    constructor(data: SlotConstructorParams) {
        this.dayId = data.dayId;

        Object.assign(this, data || {});
    }

    static clone(other: Slot, overrides?: Partial<SlotConstructorParams>): Slot {
        return new Slot({
            id: overrides?.id ?? other.id ?? undefined,
            dayId: overrides?.dayId ?? other.dayId,
            order: overrides?.order ?? other.order,
            comment: overrides?.comment ?? other.comment,
            config: overrides?.config ?? other.config,
            // entries: overrides?.entries ?? other.entries.map(entry => SlotEntry.clone(entry))
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static fromJson(json: any): Slot {
        return adapter.fromJson(json);
    }

    toJson() {
        return adapter.toJson(this);
    }
}


class SlotAdapter implements Adapter<Slot> {
    fromJson = (item: SlotApiData) => new Slot({
        id: item.id,
        dayId: item.day,
        order: item.order,
        comment: item.comment,
        config: item.config,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        entries: Object.hasOwn(item, 'entries') ? item.entries!.map((entry: any) => SlotEntry.fromJson(entry)) : []
    });

    toJson(item: Slot): Partial<SlotApiData> {
        return {
            day: item.dayId,
            order: item.order,
            comment: item.comment,
            config: item.config,
        };
    }
}

const adapter = new SlotAdapter();