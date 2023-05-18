/* eslint-disable camelcase */

import { Adapter } from "utils/Adapter";
import { Day } from "components/WorkoutRoutines/models/Day";
import { dateToYYYYMMDD } from "utils/date";

export class WorkoutRoutine {

    days: Day[] = [];

    constructor(
        public id: number,
        public name: string,
        public description: string,
        public date: Date,
        days?: Day[],
    ) {
        if (days) {
            this.days = days;
        }
    }
}


export class WorkoutRoutineAdapter implements Adapter<WorkoutRoutine> {
    fromJson(item: any) {
        return new WorkoutRoutine(
            item.id,
            item.name,
            item.description,
            new Date(item.creation_date),
        );
    }

    toJson(item: WorkoutRoutine): any {
        return {
            id: item.id,
            name: item.name,
            description: item.description,
            creation_date: dateToYYYYMMDD(item.date),
        };
    }
}