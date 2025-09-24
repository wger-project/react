import { NutritionalValues } from "components/Nutrition/helpers/nutritionalValues";
import { DiaryEntry } from "components/Nutrition/models/diaryEntry";
import { Meal } from "components/Nutrition/models/meal";
import { ApiNutritionalPlanType } from "types";
import { Adapter } from "utils/Adapter";
import { dateToYYYYMMDD, isSameDay } from "utils/date";

/* eslint-disable camelcase */

export type GroupedDiaryEntries = {
    entries: DiaryEntry[];
    nutritionalValues: NutritionalValues;
}

export const PSEUDO_MEAL_ID = -1;


type NutritionalPlanConstructorParams = {
    id?: number | null,
    creationDate?: Date,
    start?: Date,
    end?: Date | null,
    description?: string,
    onlyLogging?: boolean,
    goalEnergy?: number | null,
    goalProtein?: number | null,
    goalCarbohydrates?: number | null,
    goalFiber?: number | null,
    goalSodium?: number | null,
    goalFat?: number | null,
    goalFatsSaturated?: number | null,
};


export class NutritionalPlan {
    id: number | null;
    creationDate: Date;
    start: Date;
    end: Date | null;
    description: string;
    onlyLogging: boolean;
    goalEnergy: number | null;
    goalProtein: number | null;
    goalCarbohydrates: number | null;
    goalFiber: number | null;
    goalSodium: number | null;
    goalFat: number | null;
    goalFatsSaturated: number | null;

    meals: Meal[] = [];
    diaryEntries: DiaryEntry[] = [];

    constructor(data: NutritionalPlanConstructorParams) {
        this.id = data.id ?? null;
        this.creationDate = data.creationDate ?? new Date();
        this.start = data.start ?? this.creationDate;
        this.end = data.end ?? null;
        this.description = data.description ?? '';
        this.onlyLogging = data.onlyLogging ?? false;
        this.goalEnergy = data.goalEnergy ?? null;
        this.goalProtein = data.goalProtein ?? null;
        this.goalCarbohydrates = data.goalCarbohydrates ?? null;
        this.goalFiber = data.goalFiber ?? null;
        this.goalSodium = data.goalSodium ?? null;
        this.goalFat = data.goalFat ?? null;
        this.goalFatsSaturated = data.goalFatsSaturated ?? null;
    }


    get hasAnyGoals() {
        return this.goalEnergy !== null
            || this.goalProtein !== null
            || this.goalCarbohydrates !== null
            || this.goalFat !== null;
    }

    get hasAnyAdvancedGoals() {
        return this.goalFiber !== null
            || this.goalSodium !== null
            || this.goalFatsSaturated !== null;
    }

    get hasAnyPlanned() {
        return this.hasAnyGoals || this.plannedNutritionalValues.energy > 0;
    }

    /*
     * Returns the nutritional values for the planned meals
     */
    get plannedNutritionalValues() {
        if (this.hasAnyGoals) {
            return new NutritionalValues({
                energy: this.goalEnergy!,
                carbohydrates: this.goalCarbohydrates!,
                protein: this.goalProtein!,
                fat: this.goalFat!
            });
        }

        const out = new NutritionalValues();
        for (const item of this.meals) {
            out.add(item.plannedNutritionalValues);
        }

        return out;
    }

    /*
     * Returns the average nutritional values of the last 7 days.
     *
     * If no entries are available, the function returns an empty NutritionalValues object.
     */
    get loggedNutritionalValues7DayAvg(): NutritionalValues {
        const today = new Date();
        const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const relevantEntries = this.diaryEntries.filter(entry => entry.datetime >= sevenDaysAgo);

        return this.getAverageNutritionalValuesFromDiaryEntries(relevantEntries);
    }

    /*
     * Returns the nutritional values for the logged meals for today
     */
    get loggedNutritionalValuesToday() {
        const relevantEntries = this.diaryEntries.filter(entry => isSameDay(entry.datetime, new Date()));
        // console.log(relevantEntries);
        // console.log(this.getNutritionalValuesFromDiaryEntries(relevantEntries));
        return this.getNutritionalValuesFromDiaryEntries(relevantEntries);
    }

    /*
     * Returns a map of diary entries grouped by day
     */
    get groupDiaryEntries(): Map<string, GroupedDiaryEntries> {

        return this.diaryEntries.reduce((map, entry) => {
            const dateKey = entry.datetime.toISOString().split('T')[0]; // Use ISO string format as the key
            const entriesForDay = map.get(dateKey) || { entries: [], nutritionalValues: new NutritionalValues() };
            entriesForDay.entries.push(entry);
            entriesForDay.nutritionalValues.add(entry.nutritionalValues);
            map.set(dateKey, entriesForDay);

            return map;
        }, new Map<string, GroupedDiaryEntries>());
    }

    get percentageValuesLoggedToday() {
        return new NutritionalValues({
            protein: this.loggedNutritionalValuesToday.protein / this.plannedNutritionalValues.protein * 100,
            carbohydrates: this.loggedNutritionalValuesToday.carbohydrates / this.plannedNutritionalValues.carbohydrates * 100,
            fat: this.loggedNutritionalValuesToday.fat / this.plannedNutritionalValues.fat * 100,
        });
    }

    copyWith(values: Partial<NutritionalPlan>): NutritionalPlan {
        return new NutritionalPlan({
            id: values.id !== undefined ? values.id : this.id,
            creationDate: values.creationDate !== undefined ? values.creationDate : this.creationDate,
            start: values.start !== undefined ? values.start : this.start,
            end: values.end !== undefined ? values.end : this.end,
            description: values.description !== undefined ? values.description : this.description,
            onlyLogging: values.onlyLogging !== undefined ? values.onlyLogging : this.onlyLogging,
            goalEnergy: values.goalEnergy !== undefined ? values.goalEnergy : this.goalEnergy,
            goalProtein: values.goalProtein !== undefined ? values.goalProtein : this.goalProtein,
            goalCarbohydrates: values.goalCarbohydrates !== undefined ? values.goalCarbohydrates : this.goalCarbohydrates,
            goalFiber: values.goalFiber !== undefined ? values.goalFiber : this.goalFiber,
            goalSodium: values.goalSodium !== undefined ? values.goalSodium : this.goalSodium,
            goalFat: values.goalFat !== undefined ? values.goalFat : this.goalFat,
            goalFatsSaturated: values.goalFatsSaturated !== undefined ? values.goalFatsSaturated : this.goalFatsSaturated,
        });
    }

    /*
     * Returns a synthetic meal object for the pseudo meal 'Others'
     *
     * This contains all logs not logged to any of the other meals
     */
    pseudoMealOthers(name: string): Meal {
        const out = new Meal({
            id: PSEUDO_MEAL_ID,
            order: -1,
            name: name
        });
        out.diaryEntries = this.diaryEntries.filter((entry) => entry.mealId === null);

        return out;
    }

    /*
     * Returns the nutritional values for the logged meals for a given date
     */
    loggedNutritionalValuesDate(date: Date) {
        return this.getNutritionalValuesFromDiaryEntries(this.loggedEntriesDate(date));
    }

    /*
     * Returns the diary entries for a given date
     */
    loggedEntriesDate(date: Date) {
        return this.diaryEntries.filter(entry => isSameDay(entry.datetime, date));
    }

    getAverageNutritionalValuesFromDiaryEntries(entries: DiaryEntry[]) {
        const nrOfEntries = entries.length;
        const out = this.getNutritionalValuesFromDiaryEntries(entries);

        if (nrOfEntries === 0) {
            return out;
        }

        out.energy = out.energy / nrOfEntries;
        out.protein = out.protein / nrOfEntries;
        out.carbohydrates = out.carbohydrates / nrOfEntries;
        out.carbohydratesSugar = out.carbohydratesSugar / nrOfEntries;
        out.fat = out.fat / nrOfEntries;
        out.fatSaturated = out.fatSaturated / nrOfEntries;
        out.fiber = out.fiber / nrOfEntries;
        out.sodium = out.sodium / nrOfEntries;
        return out;
    }

    getNutritionalValuesFromDiaryEntries(entries: DiaryEntry[]) {
        return entries.reduce(
            (acc, entry) => acc.add(entry.nutritionalValues), new NutritionalValues()
        );
    }
}


export class NutritionalPlanAdapter implements Adapter<NutritionalPlan> {
    fromJson(item: ApiNutritionalPlanType) {
        return new NutritionalPlan({
            id: item.id,
            creationDate: new Date(item.creation_date),
            start: new Date(item.start),
            end: item.end !== null ? new Date(item.end) : null,
            description: item.description,
            onlyLogging: item.only_logging,
            goalEnergy: item.goal_energy,
            goalProtein: item.goal_protein,
            goalCarbohydrates: item.goal_carbohydrates,
            goalFiber: item.goal_fiber,
            goalSodium: null,
            goalFat: item.goal_fat,
            goalFatsSaturated: null,
        });
    }

    toJson(item: NutritionalPlan) {
        return {
            ...(item.id != null ? { id: item.id } : {}),

            start: dateToYYYYMMDD(item.start),
            end: item.end ? dateToYYYYMMDD(item.end) : null,
            description: item.description,
            only_logging: item.onlyLogging,
            goal_energy: item.goalEnergy,
            goal_protein: item.goalProtein,
            goal_carbohydrates: item.goalCarbohydrates,
            goal_fiber: item.goalFiber,
            goal_sodium: item.goalSodium,
            goal_fat: item.goalFat,
            goal_fats_saturated: item.goalFatsSaturated,
        };
    }
}

export const nutritionalPlanAdapter = new NutritionalPlanAdapter();