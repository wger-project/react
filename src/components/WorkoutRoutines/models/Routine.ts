/* eslint-disable camelcase */

import { Day } from "components/WorkoutRoutines/models/Day";
import { RoutineDayData } from "components/WorkoutRoutines/models/RoutineDayData";
import { RoutineLogData } from "components/WorkoutRoutines/models/RoutineLogData";
import { Adapter } from "utils/Adapter";
import { dateToYYYYMMDD } from "utils/date";

export class Routine {

    days: Day[] = [];
    logData: RoutineLogData[] = [];
    dayDataCurrentIteration: RoutineDayData[] = [];
    dayDataAllIterations: RoutineDayData[] = [];
    dayData: RoutineDayData[] = [];

    constructor(
        public id: number,
        public name: string,
        public description: string,
        public created: Date,
        public start: Date,
        public end: Date,
        days?: Day[],
    ) {
        if (days) {
            this.days = days;
        }
    }

    get groupedDayDataByIteration() {
        const groupedDayData: { [key: number]: RoutineDayData[] } = {};
        for (const dayData of this.dayDataAllIterations) {
            if (!groupedDayData[dayData.iteration]) {
                groupedDayData[dayData.iteration] = [];
            }
            groupedDayData[dayData.iteration].push(dayData);
        }

        return groupedDayData;
    }
}


export class RoutineAdapter implements Adapter<Routine> {
    fromJson(item: any) {
        return new Routine(
            item.id,
            item.name,
            item.description,
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
            start: dateToYYYYMMDD(item.start),
            end: dateToYYYYMMDD(item.end),
        };
    }
}