/* eslint-disable camelcase */

import { Adapter } from "utils/Adapter";
import { ExerciseBase } from "components/Exercises/models/exerciseBase";
import { RepetitionUnit } from "components/WorkoutRoutines/models/RepetitionUnit";
import { WeightUnit } from "components/WorkoutRoutines/models/WeightUnit";

export class WorkoutLog {

    constructor(
        public id: number,
        public date: Date,
        public baseId: number,
        public repetitionUnit: number,
        public reps: number,
        public weight: number | null,
        public weightUnit: number,
        public rir: string | null,
        public repetitionUnitObj?: RepetitionUnit,
        public weightUnitObj?: WeightUnit,
        public baseObj?: ExerciseBase,
    ) {
        if (repetitionUnitObj) {
            this.repetitionUnitObj = repetitionUnitObj;
        }

        if (weightUnitObj) {
            this.weightUnitObj = weightUnitObj;
        }

        if (baseObj) {
            this.baseObj = baseObj;
        }
    }

    get rirString(): string {
        return this.rir === null || this.rir === "" ? "-/-" : this.rir;
    }
}


export class WorkoutLogAdapter implements Adapter<WorkoutLog> {
    fromJson(item: any) {
        return new WorkoutLog(
            item.id,
            new Date(item.date),
            item.exercise_base,
            item.repetition_unit,
            item.reps,
            item.weight === null ? null : Number.parseFloat(item.weight),
            item.weight_unit,
            item.rir,
        );
    }

    toJson(item: WorkoutLog):
        any {
        return {
            id: item.id,
            exercise_base: item.baseId,
            repetition_unit: item.repetitionUnit,
            reps: item.reps,
            weight: item.weight,
            weight_unit: item.weightUnit,
            rir: item.rir,
        };
    }
}