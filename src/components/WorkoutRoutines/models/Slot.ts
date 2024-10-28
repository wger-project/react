import { SlotEntry, SlotEntryAdapter } from "components/WorkoutRoutines/models/SlotEntry";
import { Adapter } from "utils/Adapter";

export type SlotApiData = {
    id: number,
    day: number,
    order: number,
    comment: string
    configs?: any[]
}

export class Slot {

    configs: SlotEntry[] = [];

    constructor(
        public id: number,
        public dayId: number,
        public order: number,
        public comment: string,
        configs?: SlotEntry[],
    ) {
        if (configs) {
            this.configs = configs;
        }
    }
}


export class SlotAdapter implements Adapter<Slot> {
    fromJson = (item: SlotApiData) => new Slot(
        item.id,
        item.day,
        item.order,
        item.comment,
        item.hasOwnProperty('configs') ? item.configs!.map((config: any) => new SlotEntryAdapter().fromJson(config)) : []
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