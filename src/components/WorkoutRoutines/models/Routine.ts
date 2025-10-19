import { Day } from "components/WorkoutRoutines/models/Day";
import { RoutineDayData } from "components/WorkoutRoutines/models/RoutineDayData";
import i18n from 'i18next';
import { DateTime } from "luxon";
import { Adapter } from "utils/Adapter";
import { dateToYYYYMMDD, isSameDay } from "utils/date";

export const NAME_MIN_LENGTH = 3;
export const NAME_MAX_LENGTH = 25;
export const DESCRIPTION_MAX_LENGTH = 1000;

// Durations in weeks
export const MIN_WORKOUT_DURATION = 1;
export const MAX_WORKOUT_DURATION = 16;
export const DEFAULT_WORKOUT_DURATION = 12;


type RoutineConstructorParams = {
    id?: number | null;
    name?: string;
    description?: string;
    created?: Date;
    start?: Date;
    end?: Date;
    fitInWeek?: boolean;
    isTemplate?: boolean;
    isPublic?: boolean;

    days?: Day[];
    dayData?: RoutineDayData[];
};

export class Routine {
    id: number | null = null;
    name: string = '';
    description: string = '';
    created: Date = new Date();
    start: Date = new Date();
    end: Date = DateTime.local().plus({ weeks: DEFAULT_WORKOUT_DURATION }).toJSDate();
    fitInWeek: boolean = true;
    isTemplate: boolean = false;
    isPublic: boolean = false;

    days: Day[] = [];
    dayData: RoutineDayData[] = [];

    constructor(params?: RoutineConstructorParams) {
        Object.assign(this, params || {});
    }

    get isNotTemplate() {
        return !this.isTemplate;
    }

    get exercises() {
        return this.days.flatMap(day => day.slots.flatMap(slot => slot.entries.flatMap(config => config.exercise!)));
    }

    get dayDataCurrentIteration() {
        const iteration = this.getIteration() ?? 1;
        return this.dayData.filter(dayData => dayData.iteration === iteration);
    }

    /*
     * Filter out dayData entries with null days
     */
    get dayDataCurrentIterationNoNulls() {
        return this.dayDataCurrentIteration
            .filter((dayData) => dayData.day !== null)
            .sort((a, b) => a.day!.order - b.day!.order);
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
        const muscles = this.days.flatMap(day => day.slots.flatMap(slot => slot.entries.flatMap(config => config.exercise?.muscles || [])));
        return muscles.filter((muscle, index, self) =>
            index === self.findIndex((m) => m.id === muscle.id)
        );
    }

    get secondaryMuscles() {
        const muscles = this.days.flatMap(day => day.slots.flatMap(slot => slot.entries.flatMap(config => config.exercise?.musclesSecondary || [])));
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static fromJson(json: any): Routine {
        return routineAdapter.fromJson(json);
    }

    static clone(routine: Routine, overrides?: Partial<RoutineConstructorParams>): Routine {
        return new Routine({
            id: overrides?.id ?? routine.id,
            name: overrides?.name ?? routine.name,
            description: overrides?.description ?? routine.description,
            created: overrides?.created ?? new Date(),
            start: overrides?.start ?? routine.start,
            end: overrides?.end ?? routine.end ?? undefined,
            fitInWeek: overrides?.fitInWeek ?? routine.fitInWeek,
            isTemplate: overrides?.isTemplate ?? routine.isTemplate,
            isPublic: overrides?.isPublic ?? routine.isPublic,
            days: overrides?.days ?? routine.days,
            dayData: overrides?.dayData ?? routine.dayData,
        });
    }

    toJson() {
        return routineAdapter.toJson(this);
    }

    getIteration(date?: Date | undefined) {
        const dateToCheck = date ?? new Date();

        const currentDayData = this.dayData.find(dayData => isSameDay(dayData.date, dateToCheck));
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

        const slotData = dayData.slots.find(slotData =>
            slotData.setConfigs.some(setConfig => setConfig.slotEntryId === slotEntryId)
        );

        return slotData?.setConfigs.find(setConfig => setConfig.slotEntryId === slotEntryId) || null;
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


class RoutineAdapter implements Adapter<Routine> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            days: item.days ? item.days.map((day: any) => Day.fromJson(day)) : []
        });
    }

    toJson(item: Routine) {
        return {
            name: item.name,
            description: item.description,
            start: dateToYYYYMMDD(item.start),
            end: dateToYYYYMMDD(item.end),
            "fit_in_week": item.fitInWeek,
            "is_template": item.isTemplate,
            "is_public": item.isPublic
        };
    }
}

const routineAdapter = new RoutineAdapter();