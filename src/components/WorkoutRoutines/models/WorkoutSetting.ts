/* eslint-disable camelcase */

import { Exercise } from "components/Exercises/models/exercise";
import { RepetitionUnit } from "components/WorkoutRoutines/models/RepetitionUnit";
import { WeightUnit } from "components/WorkoutRoutines/models/WeightUnit";
import { Adapter } from "utils/Adapter";

export class WorkoutSetting {

    base: Exercise | undefined;

    constructor(
        public id: number,
        public date: Date,
        public exerciseId: number,
        public repetitionUnit: number,
        public reps: number,
        public weight: number | null,
        public weightUnit: number,
        public rir: string | null,
        public order: number,
        public comment: string,
        public repetitionUnitObj?: RepetitionUnit,
        public weightUnitObj?: WeightUnit,
    ) {

        if (repetitionUnitObj) {
            this.repetitionUnitObj = repetitionUnitObj;
        }
        if (weightUnitObj) {
            this.weightUnitObj = weightUnitObj;

        }
    }
}


export class SettingAdapter implements Adapter<WorkoutSetting> {
    fromJson(item: any) {
        return new WorkoutSetting(
            item.id,
            new Date(item.date),
            item.exercise_base,
            item.repetition_unit,
            item.reps,
            item.weight === null ? null : Number.parseFloat(item.weight),
            item.weight_unit,
            item.rir,
            item.order,
            item.comment,
        );
    }

    toJson(item: WorkoutSetting):
        any {
        return {
            id: item.id,
            exercise_base: item.exerciseId,
            repetition_unit: item.repetitionUnit,
            reps: item.reps,
            weight: item.weight,
            weight_unit: item.weightUnit,
            rir: item.rir,
            order: item.order,
            comment: item.comment,
        };
    }
}