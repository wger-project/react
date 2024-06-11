/* eslint-disable camelcase */

import { WorkoutSet } from "components/WorkoutRoutines/models/WorkoutSet";
import { Adapter } from "utils/Adapter";

export class Day {

    sets: WorkoutSet[] = [];

    constructor(
        public id: number,
        public nextDayId: number | null,
        public name: string,
        public description: string,
        public isRest: boolean,
        public needLogsToAdvance: boolean,
        public lastDayInWeek: boolean,
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
            item.next_day,
            item.name,
            item.description,
            item.is_rest,
            item.need_logs_to_advance,
            item.need_logs_to_advance,
        );
    }

    toJson(item: Day) {
        return {
            next_day: item.nextDayId,
            description: item.description,
            is_rest: item.isRest,
            need_logs_to_advance: item.needLogsToAdvance,
            last_day_in_week: item.lastDayInWeek
        };
    }
}
