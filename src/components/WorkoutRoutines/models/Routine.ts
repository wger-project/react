/* eslint-disable camelcase */

import { Day } from "components/WorkoutRoutines/models/Day";
import { RoutineDayData } from "components/WorkoutRoutines/models/RoutineDayData";
import { RoutineLogData } from "components/WorkoutRoutines/models/RoutineLogData";
import { WorkoutLog } from "components/WorkoutRoutines/models/WorkoutLog";
import i18n from 'i18next';
import { DateTime } from "luxon";
import { Adapter } from "utils/Adapter";
import { dateToYYYYMMDD } from "utils/date";

export const NAME_MIN_LENGTH = 3;
export const NAME_MAX_LENGTH = 25;
export const DESCRIPTION_MAX_LENGTH = 1000;

// Durations in weeks
export const MIN_WORKOUT_DURATION = 1;
export const MAX_WORKOUT_DURATION = 16;
export const DEFAULT_WORKOUT_DURATION = 12;


type RoutineConstructorParams = {
    id: number;
    name: string;
    description: string;
    created: Date;
    start: Date;
    end: Date;
    fitInWeek: boolean;
    isTemplate?: boolean;
    isPublic?: boolean;
    days?: Day[];
    logData?: RoutineLogData[];
    dayData?: RoutineDayData[];
};

export class Routine {
    id: number;
    name: string;
    description: string;
    created: Date;
    start: Date;
    end: Date;
    fitInWeek: boolean;
    isTemplate: boolean;
    isPublic: boolean;

    days: Day[] = [];
    logData: RoutineLogData[] = [];
    dayData: RoutineDayData[] = [];

    constructor(data: RoutineConstructorParams) {
        this.id = data.id;
        this.name = data.name;
        this.description = data.description;
        this.created = data.created;
        this.start = data.start;
        this.end = data.end;
        this.fitInWeek = data.fitInWeek;
        this.isTemplate = data.isTemplate ?? false;
        this.isPublic = data.isPublic ?? false;

        this.days = data.days ?? [];
        this.logData = data.logData ?? [];
        this.dayData = data.dayData ?? [];
    }

    get exercises() {
        return this.days.flatMap(day => day.slots.flatMap(slot => slot.configs.flatMap(config => config.exercise!)));
    }

    get dayDataCurrentIteration() {
        const iteration = this.getIteration() ?? 1;

        return this.dayData.filter(dayData => dayData.iteration === iteration);
    }

    get groupedDayDataByIteration() {
        const groupedDayData: { [key: number]: RoutineDayData[] } = {};
        for (const dayData of this.dayData) {
            if (!groupedDayData[dayData.iteration]) {
                groupedDayData[dayData.iteration] = [];
            }
            groupedDayData[dayData.iteration].push(dayData);
        }
        return groupedDayData;
    }

    get groupedLogsByIteration() {
        const groupedLogs: { [key: number]: WorkoutLog[] } = {};
        for (const logData of this.logData) {
            for (const log of logData.logs) {
                if (log.iteration === null) {
                    continue;
                }

                if (!groupedLogs[log.iteration]) {
                    groupedLogs[log.iteration] = [];
                }
                groupedLogs[log.iteration].push(log);
            }
        }
        return groupedLogs;
    }

    get duration() {
        const duration = DateTime.fromJSDate(this.end).diff(DateTime.fromJSDate(this.start), ['weeks', 'days']);
        const durationWeeks = Math.floor(duration.weeks);
        const durationDays = Math.floor(duration.days);

        return { weeks: durationWeeks, days: durationDays };
    }

    get durationText() {
        const durationDays = this.duration.days;
        const durationWeeks = this.duration.weeks;

        return durationDays === 0 ? i18n.t('durationWeeks', { number: durationWeeks }) : i18n.t('durationWeeksDays', {
            nrWeeks: durationWeeks,
            nrDays: durationDays
        });
    }

    get mainMuscles() {
        const muscles = this.days.flatMap(day => day.slots.flatMap(slot => slot.configs.flatMap(config => config.exercise?.muscles || [])));
        return muscles.filter((muscle, index, self) =>
            index === self.findIndex((m) => m.id === muscle.id)
        );
    }

    get secondaryMuscles() {
        const muscles = this.days.flatMap(day => day.slots.flatMap(slot => slot.configs.flatMap(config => config.exercise?.musclesSecondary || [])));
        return muscles.filter((muscle, index, self) =>
            index === self.findIndex((m) => m.id === muscle.id)
        );
    }

    /*
     * Returns the length of the cycle in days
     */
    get cycleLength() {
        return this.dayDataCurrentIteration.length;
    }

    getIteration(date?: Date | undefined) {
        const dateToCheck = date ?? new Date();

        const currentDayData = this.dayData.find(dayData =>
            dayData.date.getDate() === dateToCheck.getDate() &&
            dayData.date.getMonth() === dateToCheck.getMonth() &&
            dayData.date.getFullYear() === dateToCheck.getFullYear()
        );
        return currentDayData ? currentDayData.iteration : null;
    }

    /*
     * Returns the SetConfigData for the given dayId, iteration and slotId
     */
    getSetConfigData(dayId: number, iteration: number, slotEntryId: number) {
        const dayData = this.dayData.find(dayData =>
            dayData.day?.id === dayId && dayData.iteration === iteration
        );

        if (!dayData) {
            return null;
        }

        const slotData = dayData.slots.find(slotData => slotData.setConfigs.some(setConfig => setConfig.slotEntryId === slotEntryId));

        return slotData !== undefined && slotData.setConfigs.length > 0 ? slotData.setConfigs[0] : null;
    }


    /*
     * Returns the DayData for the given dayId and, optionally, iteration
     */
    getDayData(dayId: number, date: Date) {
        return this.dayData.filter(dayData => dayData.day?.id === dayId
            && dayData.date.getDate() === date.getDate()
            && dayData.date.getMonth() === date.getMonth()
            && dayData.date.getFullYear() === date.getFullYear(),
        );
    }
}


export class RoutineAdapter implements Adapter<Routine> {
    fromJson(item: any) {
        return new Routine({
            id: item.id,
            name: item.name,
            description: item.description,
            created: new Date(item.created),
            start: new Date(item.start),
            end: new Date(item.end),
            fitInWeek: item.fit_in_week,
            isTemplate: item.is_template,
            isPublic: item.is_public,
            days: item.days ? item.days.map((day: any) => new Day(day)) : []
        });
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

export const routineAdapter = new RoutineAdapter();