/* eslint-disable camelcase */

import { Adapter } from "utils/Adapter";

export class WorkoutSetting {

    constructor(
        public id: number,
        public baseId: number,
        public repetitionUnit: number,
        public reps: number,
        public weight: number,
        public weightUnit: number,
        public rir: string | null,
        public order: number,
        public comment: string
    ) {
    }
}


export class SettingAdapter implements Adapter<WorkoutSetting> {
    fromJson(item: any) {
        return new WorkoutSetting(
            item.id,
            item.exercise_base,
            item.repetition_unit,
            item.reps,
            item.weight,
            item.weight_unit,
            item.rir,
            item.order,
            item.comment
        );
    }

    toJson(item: WorkoutSetting): any {
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