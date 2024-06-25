import { Exercise } from "components/Exercises/models/exercise";
import { SlotConfig, SlotConfigAdapter } from "components/WorkoutRoutines/models/SlotConfig";
import { WorkoutSetting } from "components/WorkoutRoutines/models/WorkoutSetting";
import { Adapter } from "utils/Adapter";

export class Slot {

    configs: SlotConfig[] = [];

    constructor(
        public id: number,
        public order: number,
        public comment: string,
        configs?: SlotConfig[],
    ) {
        if (configs) {
            this.configs = configs;
        }
    }

    // Return all unique exercise bases from settings
    get exercises(): Exercise[] {
        return this.settingsFiltered.map(element => element.base!);
    }

    get settingsFiltered(): WorkoutSetting[] {
        const out: WorkoutSetting[] = [];
        //
        // for (const setting of this.settings) {
        //     const foundSettings = out.filter(s => s.exerciseId === setting.exerciseId);
        //
        //     if (foundSettings.length === 0) {
        //         out.push(setting);
        //     }
        // }

        return out;
    }
}


export class SlotAdapter implements Adapter<Slot> {
    fromJson = (item: any) => new Slot(
        item.id,
        item.order,
        item.comment,
        item.hasOwnProperty('configs') ? item.configs.map((config: any) => new SlotConfigAdapter().fromJson(config)) : []
    );

    toJson(item: Slot) {
        return {
            id: item.id,
            order: item.order,
            comment: item.order
        };
    }
}