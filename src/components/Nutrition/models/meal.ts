import { NutritionalValues } from "components/Nutrition/helpers/nutritionalValues";
import { DiaryEntry } from "components/Nutrition/models/diaryEntry";
import { MealItem } from "components/Nutrition/models/mealItem";
import { ApiMealType } from "types";
import { Adapter } from "utils/Adapter";
import { dateTimeToLocaleHHMM, HHMMToDateTime, isSameDay } from "utils/date";

export class Meal {

    items: MealItem[] = [];
    diaryEntries: DiaryEntry[] = [];

    constructor(
        public id: number,
        public order: number,
        public time: Date | null,
        public name: string
    ) {
    }

    get timeHHMM() {
        return dateTimeToLocaleHHMM(this.time);
    }

    /*
     * Returns the diary entries for the current day.
     */
    get diaryEntriesToday(): DiaryEntry[] {
        return this.diaryEntries.filter(entry => isSameDay(entry.datetime, new Date()));
    }

    get nutritionalValues(): NutritionalValues {
        const out = new NutritionalValues();
        for (const item of this.items) {
            out.add(item.nutritionalValues);
        }
        return out;
    }

    get nutritionalValuesDiary(): NutritionalValues {
        const out = new NutritionalValues();
        for (const entry of this.diaryEntries) {
            out.add(entry.nutritionalValues);
        }
        return out;
    }

    get nutritionalValuesDiaryToday(): NutritionalValues {
        const out = new NutritionalValues();
        for (const entry of this.diaryEntriesToday) {
            out.add(entry.nutritionalValues);
        }
        return out;
    }
}


export class MealAdapter implements Adapter<Meal> {
    fromJson(item: ApiMealType) {
        return new Meal(
            item.id,
            item.order,
            HHMMToDateTime(item.time),
            item.name,
        );
    }

    toJson(item: Meal) {
        return {
            name: item.name,
            order: item.order,
            time: dateTimeToLocaleHHMM(item.time)
        };
    }
}