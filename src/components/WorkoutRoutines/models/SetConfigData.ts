/* eslint-disable camelcase */

import { Exercise } from "components/Exercises/models/exercise";
import { Adapter } from "utils/Adapter";

export class SetConfigData {

    exercise?: Exercise;

    constructor(
        public exerciseId: number,
        public slotConfigId: number,
        public type: "normal" | "dropset" | "myo",
        public nrOfSets: number,
        public weight: number,
        public weightUnitId: number,
        public weightRounding: number,
        public reps: number,
        public repsUnitId: number,
        public repsRounding: number,
        public rir: number,
        public restTime: number,
        public textRepr: string,
        public comment: string,
    ) {
    }
}


export class SetConfigDataAdapter implements Adapter<SetConfigData> {
    fromJson = (item: any) => new SetConfigData(
        item.exercise,
        item.slot_config_id,
        item.type,
        item.sets,
        parseFloat(item.weight),
        item.weight_unit,
        parseFloat(item.weight_rounding),
        parseFloat(item.reps),
        item.reps_unit,
        parseFloat(item.reps_rounding),
        parseFloat(item.rir),
        parseFloat(item.rest),
        item.text_repr,
        item.comment,
    );
}