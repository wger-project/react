import { NutritionalValues } from "components/Nutrition/helpers/nutritionalValues";
import { DiaryEntry } from "components/Nutrition/models/diaryEntry";
import { Meal } from "components/Nutrition/models/meal";
import { ApiNutritionalPlanType } from "types";
import { Adapter } from "utils/Adapter";
import { isSameDay } from "utils/date";

export type GroupedDiaryEntries = {
    entries: DiaryEntry[];
    nutritionalValues: NutritionalValues;
}

export const PSEUDO_MEAL_ID = -1;


export class NutritionalPlan {

    meals: Meal[] = [];
    diaryEntries: DiaryEntry[] = [];

    constructor(
        public id: number,
        public creationDate: Date,
        public description: string,
        public onlyLogging: boolean
    ) {
    }

    /*
     * Returns the nutritional values for the planned meals
     */
    get plannedNutritionalValues(): NutritionalValues {
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

    /*
     * Returns a synthetic meal object for the pseudo meal 'Others'
     *
     * This contains all logs which were not logged to any of the other meals
     */
    get pseudoMealOthers(): Meal {
        const out = new Meal(
            PSEUDO_MEAL_ID,
            -1,
            null,
            'Others'
        );
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
        out.fibres = out.fibres / nrOfEntries;
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
        return new NutritionalPlan(
            item.id,
            new Date(item.creation_date),
            item.description,
            item.only_logging
        );
    }

    toJson(item: NutritionalPlan) {
        return {
            description: item.description
        };
    }
}
