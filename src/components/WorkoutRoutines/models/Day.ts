import { Adapter } from "utils/Adapter";
import { WorkoutSet } from "components/WorkoutRoutines/models/WorkoutSet";

export class Day {

    sets: WorkoutSet[] = [];

    constructor(
        public id: number,
        public description: string,
        public daysOfWeek: number[],
        sets?: WorkoutSet[]
    ) {
        if (sets) {
            this.sets = sets;
        }
    }
}


export class DayAdapter implements Adapter<Day> {
    fromJson(item: any): Day {
        return new Day(
            item.id,
            item.description,
            item.day
        );
    }

    toJson(item: Day) {
        return {
            id: item.id,
            description: item.description,
            day: item.daysOfWeek
        };
    }
}