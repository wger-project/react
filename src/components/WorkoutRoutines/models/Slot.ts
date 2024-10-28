import { SlotEntry, SlotEntryAdapter } from "components/WorkoutRoutines/models/SlotEntry";
import { Adapter } from "utils/Adapter";

export type SlotApiData = {
    id: number,
    day: number,
    order: number,
    comment: string
    entries?: any[]
}

export class Slot {

    configs: SlotEntry[] = [];

    constructor(
        public id: number,
        public dayId: number,
        public order: number,
        public comment: string,
        entries?: SlotEntry[],
    ) {
        if (entries) {
            this.configs = entries;
        }
    }
}


export class SlotAdapter implements Adapter<Slot> {
    fromJson = (item: SlotApiData) => new Slot(
        item.id,
        item.day,
        item.order,
        item.comment,
        item.hasOwnProperty('entries') ? item.entries!.map((entry: any) => new SlotEntryAdapter().fromJson(entry)) : []
    );

    toJson(item: Slot) {
        return {
            id: item.id,
            day: item.dayId,
            order: item.order,
            comment: item.order
        };
    }
}