/* eslint-disable camelcase */

import { NrOfSetsConfig } from "components/WorkoutRoutines/models/NrOfSetsConfig";
import { RepsConfig } from "components/WorkoutRoutines/models/RepsConfig";
import { RestConfig } from "components/WorkoutRoutines/models/RestConfig";
import { RirConfig } from "components/WorkoutRoutines/models/RirConfig";
import { WeightConfig } from "components/WorkoutRoutines/models/WeightConfig";
import { Adapter } from "utils/Adapter";

export class SlotConfig {

    weightConfigs: WeightConfig[] = [];
    repsConfigs: RepsConfig[] = [];
    restTimeConfigs: RestConfig[] = [];
    nrOfSetsConfigs: NrOfSetsConfig[] = [];
    rirConfigs: RirConfig[] = [];

    constructor(
        public id: number,
        public slotId: number,
        public exerciseId: number,
        public repetitionUnitId: number,
        public repetitionRounding: number,
        public weightUnitId: number,
        public weightRounding: number,
        public order: number,
        public comment: string,
        public isDropset: boolean,
    ) {
    }
}


export class SlotConfigAdapter implements Adapter<SlotConfig> {
    fromJson = (item: any) => new SlotConfig(
        item.id,
        item.slot,
        item.exercise,
        item.repetition_unit,
        item.repetition_rounding,
        item.weight_unit,
        item.weight_rounding,
        item.order,
        item.comment,
        item.is_dropset,
    );

    toJson = (item: SlotConfig) => ({
        slot: item.slotId,
        exercise: item.exerciseId,
        repetition_unit: item.repetitionUnitId,
        repetition_rounding: item.repetitionRounding,
        weight_unit: item.weightUnitId,
        weight_rounding: item.weightRounding,
        order: item.order,
        comment: item.comment,
        is_dropset: item.isDropset
    });
}