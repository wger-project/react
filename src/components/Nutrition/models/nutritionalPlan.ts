import { Adapter } from "utils/Adapter";
import { ApiNutritionalPlanType } from "types";
import { Meal } from "components/Nutrition/models/meal";
import { DiaryEntry } from "components/Nutrition/models/diaryEntry";
import { NutritionalValues } from "components/Nutrition/helpers/nutritionalValues";
import { isSameDay } from "utils/date";

export type GroupedDiaryEntries = {
    entries: DiaryEntry[];
    nutritionalValues: NutritionalValues;
}


export class NutritionalPlan {

    meals: Meal[] = [];
    diaryEntries: DiaryEntry[] = [];

    constructor(
        public id: number,
        public creationDate: Date,
        public description: string,
    ) {
    }

    /*
     * Returns the nutritional values for the planned meals
     */
    get nutritionalValues(): NutritionalValues {
        const out = new NutritionalValues();
        for (const item of this.meals)
            out.add(item.nutritionalValues);

        return out;
    }

    /*
     * Returns the average nutritional values of the last 7 days.
     *
     * If no entries are available, the function returns an empty NutritionalValues object.
     */
    get nutritionalValues7DayAvg(): NutritionalValues {
        const today = new Date();
        const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const relevantEntries = this.diaryEntries.filter(entry => entry.datetime >= sevenDaysAgo);

        return this.calculateNutritionalValues(relevantEntries);
    }

    /*
     * Returns the nutritional values for the logged meals for today
     */
    get nutritionalValuesDiaryToday(): NutritionalValues {
        const relevantEntries = this.diaryEntries.filter(entry => isSameDay(entry.datetime, new Date()));
        return this.calculateNutritionalValues(relevantEntries);
    }

    calculateNutritionalValues(entries: DiaryEntry[]): NutritionalValues {
        const out = new NutritionalValues();

        if (entries.length === 0)
            return out;

        const sum = entries.reduce((accumulator, entry) => accumulator.add(entry.nutritionalValues), new NutritionalValues());
        const nrOfEntries = entries.length;

        out.energy = sum.energy / nrOfEntries;
        out.protein = sum.protein / nrOfEntries;
        out.carbohydrates = sum.carbohydrates / nrOfEntries;
        out.carbohydratesSugar = sum.carbohydratesSugar / nrOfEntries;
        out.fat = sum.fat / nrOfEntries;
        out.fatSaturated = sum.fatSaturated / nrOfEntries;
        out.fibres = sum.fibres / nrOfEntries;
        out.sodium = sum.sodium / nrOfEntries;
        return out;
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
}


export class NutritionalPlanAdapter implements Adapter<NutritionalPlan> {
    fromJson(item: ApiNutritionalPlanType) {
        return new NutritionalPlan(
            item.id,
            new Date(item.creation_date),
            item.description
        );
    }

    toJson(item: NutritionalPlan) {
        return {
            description: item.description
        };
    }
}
