/* eslint-disable camelcase */

import { Exercise } from "components/Exercises/models/exercise";
import { RepetitionUnit } from "components/WorkoutRoutines/models/RepetitionUnit";
import { WeightUnit } from "components/WorkoutRoutines/models/WeightUnit";
import { Adapter } from "utils/Adapter";

export interface LogEntryForm {
    exercise: Exercise | null;
    repsUnit: RepetitionUnit | null;
    weightUnit: WeightUnit | null;
    slotEntry: number | null;
    rir: number | string;
    rirTarget: number | string | null;
    reps: number | string;
    repsTarget: number | string | null;
    weight: number | string;
    weightTarget: number | string | null;
}


export class WorkoutLog {
    public id: number;
    public date: Date;
    public iteration: number | null;
    public exerciseId: number;
    public slotEntryId: number | null;

    public repetitionUnitObj: RepetitionUnit | null;
    public repetitionUnitId: number;
    public reps: number | null;
    public repsTarget: number | null;

    public weightUnitObj: WeightUnit | null;
    public weightUnitId: number;
    public weight: number | null;
    public weightTarget: number | null;

    public rir: string | null;
    public rirTarget: string | null;


    public exerciseObj?: Exercise;

    constructor(data: {
        id: number;
        date: Date | string;
        iteration: number | null;
        slotEntryId: number | null;

        exerciseObj?: Exercise;
        exerciseId: number;

        repetitionUnitObj?: RepetitionUnit;
        repetitionUnitId: number;
        reps: number | null;
        repsTarget?: number | null;

        weightUnitObj?: WeightUnit;
        weightUnitId: number;
        weight: number | null;
        weightTarget?: number | null;

        rir: string | null;
        rirTarget?: string | null;
    }) {
        this.id = data.id;
        this.date = typeof data.date === 'string' ? new Date(data.date) : data.date;
        this.iteration = data.iteration;
        this.slotEntryId = data.slotEntryId;

        this.exerciseObj = data.exerciseObj;
        this.exerciseId = data.exerciseId;

        this.repetitionUnitObj = data.repetitionUnitObj || null;
        this.repetitionUnitId = data.repetitionUnitId;
        this.reps = data.reps;
        this.repsTarget = data.repsTarget || null;

        this.weightUnitObj = data.weightUnitObj || null;
        this.weightUnitId = data.weightUnitId;
        this.weight = data.weight;
        this.weightTarget = data.weightTarget || null;

        this.rir = data.rir;
        this.rirTarget = data.rirTarget || null;
    }

    get rirString(): string {
        return this.rir === null ? "-/-" : this.rir.toString();
    }
}


export class WorkoutLogAdapter implements Adapter<WorkoutLog> {
    fromJson(item: any) {
        return new WorkoutLog({
            id: item.id,
            date: item.date, // Pass the date string directly
            iteration: item.iteration,
            exerciseId: item.exercise,
            slotEntryId: item.slot_entry,

            repetitionUnitId: item.repetition_unit,
            reps: item.reps,
            repsTarget: item.reps_target,

            weightUnitId: item.weight_unit,
            weight: item.weight === null ? null : Number.parseFloat(item.weight),
            weightTarget: item.weight_target === null ? null : Number.parseFloat(item.weight_target),

            rir: item.rir,
            rirTarget: item.rir_target,
        });
    }

    toJson(item: WorkoutLog) {
        return {
            id: item.id,
            iteration: item.iteration,
            slot_entry: item.slotEntryId,
            exercise_base: item.exerciseId,

            repetition_unit: item.repetitionUnitId,
            reps: item.reps,
            reps_target: item.repsTarget,

            weight_unit: item.weightUnitId,
            weight: item.weight,
            weight_target: item.weightTarget,

            rir: item.rir,
            rir_target: item.rirTarget,
        };
    }
}