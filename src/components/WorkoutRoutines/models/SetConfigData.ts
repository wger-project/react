/* eslint-disable camelcase */

import { Exercise } from "components/Exercises/models/exercise";
import { RepetitionUnit } from "components/WorkoutRoutines/models/RepetitionUnit";
import { WeightUnit } from "components/WorkoutRoutines/models/WeightUnit";
import { Adapter } from "utils/Adapter";

export type SetType = "normal" | "dropset" | "myo" | "partial" | "forced" | "tut" | "iso" | "jump";

export class SetConfigData {

    exercise?: Exercise;
    weightUnit: WeightUnit | null = null;
    repetitionsUnit: RepetitionUnit | null = null;

    public exerciseId: number;
    public slotEntryId: number;
    public type: SetType;
    public nrOfSets: number;
    public maxNrOfSets: number | null;
    public weight: number | null;
    public maxWeight: number | null;
    public weightUnitId: number;
    public weightRounding: number | null = null;
    public repetitions: number | null;
    public maxRepetitions: number | null;
    public repetitionsUnitId: number;
    public repetitionsRounding: number | null = null;
    public rir: number | null;
    public maxRir: number | null;
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
        weightUnit?: WeightUnit,
        weightRounding: number | null,

        repetitions?: number | null,
        maxRepetitions?: number | null,
        repetitionsUnitId: number,
        repetitionsUnit?: RepetitionUnit,
        repetitionsRounding: number | null,

        rir?: number | null,
        maxRir?: number | null,
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
        this.weightUnit = data.weightUnit ?? null;
        this.weightRounding = data.weightRounding;

        this.repetitions = data.repetitions ?? null;
        this.maxRepetitions = data.maxRepetitions ?? null;
        this.repetitionsUnitId = data.repetitionsUnitId;
        this.repetitionsUnit = data.repetitionsUnit ?? null;
        this.repetitionsRounding = data.repetitionsRounding;

        this.rir = data.rir ?? null;
        this.maxRir = data.maxRir ?? null;
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
        maxNrOfSets: item.max_sets !== null ? parseInt(item.max_sets) : null,
        weight: item.weight !== null ? parseFloat(item.weight) : null,
        maxWeight: item.max_weight !== null ? parseFloat(item.max_weight) : null,
        weightUnitId: item.weight_unit,
        weightRounding: item.weight_rounding !== null ? parseFloat(item.weight_rounding) : null,
        repetitions: item.rerepetitionsps !== null ? parseFloat(item.repetitions) : null,
        maxRepetitions: item.max_repetitions !== null ? parseFloat(item.max_repetitions) : null,
        repetitionsUnitId: item.repetitions_unit,
        repetitionsRounding: item.repetitions_rounding !== null ? parseFloat(item.repetitions_rounding) : null,
        rir: item.rir !== null ? parseFloat(item.rir) : null,
        maxRir: item.max_rir !== null ? parseFloat(item.max_rir) : null,
        rpe: item.rpe !== null ? parseFloat(item.rpe) : null,
        restTime: item.rest !== null ? parseInt(item.rest) : null,
        maxRestTime: item.max_rest !== null ? parseInt(item.max_rest) : null,
        textRepr: item.text_repr,
        comment: item.comment,
    });
}