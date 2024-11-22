/* eslint-disable camelcase */

import { Day } from "components/WorkoutRoutines/models/Day";
import { RoutineStatsData } from "components/WorkoutRoutines/models/LogStats";
import { RoutineDayData } from "components/WorkoutRoutines/models/RoutineDayData";
import { RoutineLogData } from "components/WorkoutRoutines/models/RoutineLogData";
import { Adapter } from "utils/Adapter";
import { dateToYYYYMMDD } from "utils/date";

export const NAME_MIN_LENGTH = 3;
export const NAME_MAX_LENGTH = 25;
export const DESCRIPTION_MAX_LENGTH = 1000;

// Duration in weeks
export const MIN_WORKOUT_DURATION = 2;
export const MAX_WORKOUT_DURATION = 16;
export const DEFAULT_WORKOUT_DURATION = 12;

export class Routine {

    days: Day[] = [];
    logData: RoutineLogData[] = [];
    dayDataCurrentIteration: RoutineDayData[] = [];
    dayDataAllIterations: RoutineDayData[] = [];
    stats: RoutineStatsData = new RoutineStatsData();

    constructor(
        public id: number,
        public name: string,
        public description: string,
        public created: Date,
        public start: Date,
        public end: Date,
        public fitInWeek: boolean,
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
            item.fit_in_week,
        );
    }

    toJson(item: Routine) {
        return {
            id: item.id,
            name: item.name,
            description: item.description,
            start: dateToYYYYMMDD(item.start),
            end: dateToYYYYMMDD(item.end),
            fit_in_week: item.fitInWeek,
        };
    }
}