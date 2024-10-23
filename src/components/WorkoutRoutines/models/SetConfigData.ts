/* eslint-disable camelcase */

import { Exercise } from "components/Exercises/models/exercise";
import { Adapter } from "utils/Adapter";

export type SetType = "normal" | "dropset" | "myo" | "partial" | "forced" | "tut" | "iso" | "jump";

export class SetConfigData {

    exercise?: Exercise;

    constructor(
        public exerciseId: number,
        public slotConfigId: number,
        public type: SetType,
        public nrOfSets: number,
        public weight: number | null,
        public maxWeight: number | null,
        public weightUnitId: number,
        public weightRounding: number,
        public reps: number | null,
        public maxReps: number | null,
        public repsUnitId: number,
        public repsRounding: number,
        public rir: number | null,
        public rpe: number | null,
        public restTime: number | null,
        public maxRestTime: number | null,
        public textRepr: string,
        public comment: string,
        exercise?: Exercise,
    ) {
        this.exercise = exercise;
    }

    public get isSpecialType(): boolean {
        return this.type !== 'normal';
    }
}


export class SetConfigDataAdapter implements Adapter<SetConfigData> {
    fromJson = (item: any) => new SetConfigData(
        item.exercise,
        item.slot_config_id,
        item.type,
        item.sets,
        item.weight !== null ? parseFloat(item.weight) : null,
        item.max_weight !== null ? parseFloat(item.max_weight) : null,
        item.weight_unit,
        parseFloat(item.weight_rounding),
        item.reps !== null ? parseFloat(item.reps) : null,
        item.max_reps !== null ? parseFloat(item.max_reps) : null,
        item.reps_unit,
        parseFloat(item.reps_rounding),
        item.rir !== null ? parseFloat(item.rir) : null,
        item.rpe !== null ? parseFloat(item.rpe) : null,
        item.rest !== null ? parseFloat(item.rest) : null,
        item.max_rest !== null ? parseFloat(item.max_rest) : null,
        item.text_repr,
        item.comment,
    );
}