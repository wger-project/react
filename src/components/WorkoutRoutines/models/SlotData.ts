/* eslint-disable camelcase */

import { Exercise } from "components/Exercises/models/exercise";
import { SetConfigData, SetConfigDataAdapter } from "components/WorkoutRoutines/models/SetConfigData";
import { Adapter } from "utils/Adapter";

export class SlotData {

    exercises: Exercise[] = [];

    constructor(
        public comment: string,
        public isSuperset: boolean,
        public exerciseIds: number[],
        public setConfigs: SetConfigData[],
        exercises?: Exercise[],
    ) {
        this.exercises = exercises ?? [];
    }
}


export class SlotDataAdapter implements Adapter<SlotData> {
    fromJson = (item: any) => new SlotData(
        item.comment,
        item.is_superset,
        item.exercises,
        item.sets.map((item: any) => new SetConfigDataAdapter().fromJson(item))
    );
}