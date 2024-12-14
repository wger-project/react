/* eslint-disable camelcase */

import { Exercise } from "components/Exercises/models/exercise";
import { RepetitionUnit } from "components/WorkoutRoutines/models/RepetitionUnit";
import { WeightUnit } from "components/WorkoutRoutines/models/WeightUnit";
import { Adapter } from "utils/Adapter";

export interface LogEntryForm {
    exercise: Exercise | null;
    repsUnit: RepetitionUnit | null;
    weightUnit: WeightUnit | null;
    rir: number | string;
    reps: number | string;
    weight: number | string;
}


export class WorkoutLog {
    public id: number;
    public date: Date;
    public iteration: number | null;
    public exerciseId: number;
    public slotEntryId: number | null;
    public repetitionUnitId: number;
    public reps: number;
    public weight: number | null;
    public weightUnitId: number;
    public rir: string | null;
    public repetitionUnitObj?: RepetitionUnit;
    public weightUnitObj?: WeightUnit;
    public exerciseObj?: Exercise;

    constructor(data: {
        id: number;
        date: Date | string;
        iteration: number | null;
        exerciseId: number;
        slotEntryId: number | null;
        repetitionUnitId: number;
        reps: number;
        weight: number | null;
        weightUnitId: number;
        rir: string | null;
        repetitionUnitObj?: RepetitionUnit;
        weightUnitObj?: WeightUnit;
        exerciseObj?: Exercise;
    }) {
        this.id = data.id;
        this.date = typeof data.date === 'string' ? new Date(data.date) : data.date;
        this.iteration = data.iteration;
        this.exerciseId = data.exerciseId;
        this.slotEntryId = data.slotEntryId;
        this.repetitionUnitId = data.repetitionUnitId;
        this.reps = data.reps;
        this.weight = data.weight;
        this.weightUnitId = data.weightUnitId;
        this.rir = data.rir;
        this.repetitionUnitObj = data.repetitionUnitObj;
        this.weightUnitObj = data.weightUnitObj;
        this.exerciseObj = data.exerciseObj;
    }

    get rirString(): string {
        return this.rir === null || this.rir === "" ? "-/-" : this.rir;
    }
}


export class WorkoutLogAdapter implements Adapter<WorkoutLog> {
    fromJson(item: any) {
        return new WorkoutLog({
            id: item.id,
            date: item.date, // Pass the date string directly
            iteration: item.iteration,
            exerciseId: item.exercise,
            slotEntryId: item.set_config,
            repetitionUnitId: item.repetition_unit,
            reps: item.reps,
            weight: item.weight === null ? null : Number.parseFloat(item.weight),
            weightUnitId: item.weight_unit,
            rir: item.rir,
        });
    }

    toJson(item: WorkoutLog) {
        return {
            id: item.id,
            iteration: item.iteration,
            set_config: item.slotEntryId,
            exercise_base: item.exerciseId,
            repetition_unit: item.repetitionUnitId,
            reps: item.reps,
            weight: item.weight,
            weight_unit: item.weightUnitId,
            rir: item.rir,
        };
    }
}