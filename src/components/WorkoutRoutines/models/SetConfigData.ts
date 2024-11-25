/* eslint-disable camelcase */

import { Exercise } from "components/Exercises/models/exercise";
import { RepetitionUnit } from "components/WorkoutRoutines/models/RepetitionUnit";
import { WeightUnit } from "components/WorkoutRoutines/models/WeightUnit";
import { Adapter } from "utils/Adapter";

export type SetType = "normal" | "dropset" | "myo" | "partial" | "forced" | "tut" | "iso" | "jump";

export class SetConfigData {

    exercise?: Exercise;
    weightUnit: WeightUnit | null = null;
    repsUnit: RepetitionUnit | null = null;

    public exerciseId: number;
    public slotEntryId: number;
    public type: SetType;
    public nrOfSets: number;
    public maxNrOfSets: number | null;
    public weight: number | null;
    public maxWeight: number | null;
    public weightUnitId: number;
    public weightRounding: number;
    public reps: number | null;
    public maxReps: number | null;
    public repsUnitId: number;
    public repsRounding: number;
    public rir: number | null;
    public rpe: number | null;
    public restTime: number | null;
    public maxRestTime: number | null;
    public textRepr: string;
    public comment: string;

    constructor(data: {
        exercise?: Exercise,
        exerciseId: number,
        slotEntryId: number,
        type: SetType,
        nrOfSets: number,
        maxNrOfSets?: number | null,
        weight?: number | null,
        maxWeight?: number | null,
        weightUnitId: number,
        weightRounding: number,
        reps?: number | null,
        maxReps?: number | null,
        repsUnitId: number,
        repsRounding: number,
        rir?: number | null,
        rpe?: number | null,
        restTime?: number | null,
        maxRestTime?: number | null,
        textRepr: string,
        comment: string,
    }) {
        this.exerciseId = data.exerciseId;
        this.exercise = data.exercise;
        this.slotEntryId = data.slotEntryId;
        this.type = data.type;
        this.nrOfSets = data.nrOfSets;
        this.maxNrOfSets = data.maxNrOfSets ?? null;
        this.weight = data.weight ?? null;
        this.maxWeight = data.maxWeight ?? null;
        this.weightUnitId = data.weightUnitId;
        this.weightRounding = data.weightRounding;
        this.reps = data.reps ?? null;
        this.maxReps = data.maxReps ?? null;
        this.repsUnitId = data.repsUnitId;
        this.repsRounding = data.repsRounding;
        this.rir = data.rir ?? null;
        this.rpe = data.rpe ?? null;
        this.restTime = data.restTime ?? null;
        this.maxRestTime = data.maxRestTime ?? null;
        this.textRepr = data.textRepr;
        this.comment = data.comment;
    }

    public get isSpecialType(): boolean {
        return this.type !== 'normal';
    }
}


export class SetConfigDataAdapter implements Adapter<SetConfigData> {
    fromJson = (item: any) => new SetConfigData({
        exerciseId: item.exercise,
        slotEntryId: item.slot_entry_id,
        type: item.type,
        nrOfSets: item.sets,
        maxNrOfSets: item.max_sets !== null ? parseFloat(item.max_sets) : null,
        weight: item.weight !== null ? parseFloat(item.weight) : null,
        maxWeight: item.max_weight !== null ? parseFloat(item.max_weight) : null,
        weightUnitId: item.weight_unit,
        weightRounding: parseFloat(item.weight_rounding),
        reps: item.reps !== null ? parseFloat(item.reps) : null,
        maxReps: item.max_reps !== null ? parseFloat(item.max_reps) : null,
        repsUnitId: item.reps_unit,
        repsRounding: parseFloat(item.reps_rounding),
        rir: item.rir !== null ? parseFloat(item.rir) : null,
        rpe: item.rpe !== null ? parseFloat(item.rpe) : null,
        restTime: item.rest !== null ? parseFloat(item.rest) : null,
        maxRestTime: item.max_rest !== null ? parseFloat(item.max_rest) : null,
        textRepr: item.text_repr,
        comment: item.comment,
    });
}