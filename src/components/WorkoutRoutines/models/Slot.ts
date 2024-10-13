import { SlotConfig, SlotConfigAdapter } from "components/WorkoutRoutines/models/SlotConfig";
import { Adapter } from "utils/Adapter";

export class Slot {

    configs: SlotConfig[] = [];

    constructor(
        public id: number,
        public dayId: number,
        public order: number,
        public comment: string,
        configs?: SlotConfig[],
    ) {
        if (configs) {
            this.configs = configs;
        }
    }
}


export class SlotAdapter implements Adapter<Slot> {
    fromJson = (item: any) => new Slot(
        item.id,
        item.day,
        item.order,
        item.comment,
        item.hasOwnProperty('configs') ? item.configs.map((config: any) => new SlotConfigAdapter().fromJson(config)) : []
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