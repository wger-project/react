import { WorkoutSet } from "components/WorkoutRoutines/models/WorkoutSet";
import { Adapter } from "utils/Adapter";

export class Day {

    sets: WorkoutSet[] = [];

    constructor(
        public id: number,
        public description: string,
        public isRest: boolean,
        public needLogsToAdvance: boolean,
        public nextDayId: number,
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
            item.is_rest,
            item.need_logs_to_advance,
            item.next_day,
        );
    }

    toJson(item: Day) {
        return {
            id: item.id,
            description: item.description,
            // eslint-disable-next-line camelcase
            is_rest: item.isRest,
            // eslint-disable-next-line camelcase
            need_logs_to_advance: item.needLogsToAdvance,
            // eslint-disable-next-line camelcase
            next_day: item.nextDayId
        };
    }
}