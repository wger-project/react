import { Adapter } from "utils/Adapter";
import { WorkoutSetting } from "components/WorkoutRoutines/models/WorkoutSetting";

export class WorkoutSet {

    settings: WorkoutSetting[] = [];

    constructor(
        public id: number,
        public sets: number,
        public order: number,
        public comment: string,
        settings?: WorkoutSetting[]
    ) {
        
        if (settings) {
            this.settings = settings;
        }
    }
}


export class SetAdapter implements Adapter<WorkoutSet> {
    fromJson(item: any) {
        return new WorkoutSet(
            item.id,
            item.sets,
            item.order,
            item.comment
        );
    }

    toJson(item: WorkoutSet): any {
        return {
            id: item.id,
            sets: item.sets,
            order: item.order,
            comment: item.order
        };
    }
}