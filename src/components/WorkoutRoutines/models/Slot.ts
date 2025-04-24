import { SlotEntry, slotEntryAdapter } from "components/WorkoutRoutines/models/SlotEntry";
import { Adapter } from "utils/Adapter";

export type SlotApiData = {
    id: number,
    day: number,
    order: number,
    comment: string
    config: any
    entries?: any[]
}

type SlotConstructorParams = {
    id: number;
    dayId: number;
    order: number;
    comment: string;
    config: object | null;
    entries?: SlotEntry[];
};

export class Slot {

    id: number;
    dayId: number;
    order: number;
    comment: string;
    config: object | null;

    entries: SlotEntry[] = [];

    constructor({
                    id,
                    dayId,
                    order,
                    comment,
                    config,
                    entries = []
                }: SlotConstructorParams) {
        this.id = id;
        this.dayId = dayId;
        this.order = order;
        this.comment = comment;
        this.config = config;
        this.entries = entries;
    }
}


export class SlotAdapter implements Adapter<Slot> {
    fromJson = (item: SlotApiData) => new Slot({
        id: item.id,
        dayId: item.day,
        order: item.order,
        comment: item.comment,
        config: item.config,
        entries: Object.hasOwn(item, 'entries') ? item.entries!.map((entry: any) => slotEntryAdapter.fromJson(entry)) : []
    });

    toJson(item: Slot) {
        return {
            id: item.id,
            day: item.dayId,
            order: item.order,
            comment: item.order,
            config: item.config
        };
    }
}