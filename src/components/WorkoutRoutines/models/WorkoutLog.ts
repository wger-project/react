/* eslint-disable camelcase */

import { Exercise } from "components/Exercises/models/exercise";
import { RepetitionUnit } from "components/WorkoutRoutines/models/RepetitionUnit";
import { WeightUnit } from "components/WorkoutRoutines/models/WeightUnit";
import { Adapter } from "utils/Adapter";

export class WorkoutLog {

    constructor(
        public id: number,
        public date: Date,
        public iteration: number,
        public exerciseId: number,
        public slotEntryId: number,
        public repetitionUnitId: number,
        public reps: number,
        public weight: number | null,
        public weightUnitId: number,
        public rir: string | null,
        public repetitionUnitObj?: RepetitionUnit,
        public weightUnitObj?: WeightUnit,
        public exerciseObj?: Exercise,
    ) {
        if (repetitionUnitObj) {
            this.repetitionUnitObj = repetitionUnitObj;
        }

        if (weightUnitObj) {
            this.weightUnitObj = weightUnitObj;
        }

        if (exerciseObj) {
            this.exerciseObj = exerciseObj;
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
            item.iteration,
            item.exercise_base,
            item.set_config,
            item.repetition_unit,
            item.reps,
            item.weight === null ? null : Number.parseFloat(item.weight),
            item.weight_unit,
            item.rir,
        );
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