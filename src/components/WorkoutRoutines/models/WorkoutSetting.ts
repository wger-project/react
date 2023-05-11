/* eslint-disable camelcase */

import { Adapter } from "utils/Adapter";
import { ExerciseBase } from "components/Exercises/models/exerciseBase";
import { RepetitionUnit } from "components/WorkoutRoutines/models/RepetitionUnit";
import { WeightUnit } from "components/WorkoutRoutines/models/WeightUnit";

export class WorkoutSetting {

    base: ExerciseBase | undefined;

    constructor(
        public id: number,
        public baseId: number,
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
        if (repetitionUnitObj) {
            this.repetitionUnitObj = repetitionUnitObj;

        }
    }
}


export class SettingAdapter implements Adapter<WorkoutSetting> {
    fromJson(item: any) {
        return new WorkoutSetting(
            item.id,
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
            exercise_base: item.baseId,
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