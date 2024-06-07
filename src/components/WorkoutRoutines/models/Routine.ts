/* eslint-disable camelcase */

import { Day } from "components/WorkoutRoutines/models/Day";
import { WorkoutSession } from "components/WorkoutRoutines/models/WorkoutSession";
import { Adapter } from "utils/Adapter";
import { dateToYYYYMMDD } from "utils/date";

export class Routine {

    days: Day[] = [];
    sessions: WorkoutSession[] = [];

    constructor(
        public id: number,
        public name: string,
        public description: string,
        public firstDay: number | null,
        public created: Date,
        public start: Date,
        public end: Date,
        days?: Day[],
    ) {
        if (days) {
            this.days = days;
        }
    }
}


export class RoutineAdapter implements Adapter<Routine> {
    fromJson(item: any) {
        return new Routine(
            item.id,
            item.name,
            item.description,
            item.first_day,
            new Date(item.created),
            new Date(item.start),
            new Date(item.end),
        );
    }

    toJson(item: Routine) {
        return {
            id: item.id,
            name: item.name,
            description: item.description,
            first_day: item.firstDay,
            start: dateToYYYYMMDD(item.start),
            end: dateToYYYYMMDD(item.end),
        };
    }
}