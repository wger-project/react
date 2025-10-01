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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fromJson = (item: any) => new SlotData(
        item.comment,
        item.is_superset,
        item.exercises,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        item.sets.map((item: any) => new SetConfigDataAdapter().fromJson(item))
    );
}