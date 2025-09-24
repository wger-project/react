import { NutritionalValues } from "components/Nutrition/helpers/nutritionalValues";
import { DiaryEntry } from "components/Nutrition/models/diaryEntry";
import { MealItem } from "components/Nutrition/models/mealItem";
import { Adapter } from "utils/Adapter";
import { dateTimeToHHMM, dateTimeToLocaleHHMM, HHMMToDateTime, isSameDay } from "utils/date";

export interface ApiMealType {
    id: number,
    plan: number,
    order: number,
    time: string | null,
    name: string
}


export type MealConstructorParams = {
    id?: number | null;
    planId?: number | null;
    order?: number;
    time?: Date | null;
    name: string;
    items?: MealItem[];
    diaryEntries?: DiaryEntry[];
};

export class Meal {

    public id: number | null = null;
    public planId: number | null = null;
    public order: number;
    public time: Date | null = null;
    public name: string;
    public items: MealItem[];
    public diaryEntries: DiaryEntry[];

    constructor(params: MealConstructorParams) {
        this.id = params.id || null;
        this.planId = params.planId || null;
        this.order = params.order || 1;
        this.time = params.time || null;
        this.name = params.name;
        this.items = params.items || [];
        this.diaryEntries = params.diaryEntries || [];
    }

    get timeHHMMLocale() {
        return dateTimeToLocaleHHMM(this.time);
    }

    get displayName() {
        return this.name ? this.name : this.timeHHMMLocale;
    }

    /*
     * Returns the diary entries for the current day.
     */
    get diaryEntriesToday(): DiaryEntry[] {
        return this.diaryEntries.filter(entry => isSameDay(entry.datetime, new Date()));
    }

    get plannedNutritionalValues(): NutritionalValues {
        const out = new NutritionalValues();
        for (const item of this.items) {
            out.add(item.nutritionalValues);
        }
        return out;
    }

    get loggedNutritionalValuesToday(): NutritionalValues {
        const out = new NutritionalValues();
        for (const entry of this.diaryEntriesToday) {
            out.add(entry.nutritionalValues);
        }
        return out;
    }

    static clone(other: Meal, overrides?: Partial<MealConstructorParams>): Meal {
        return new Meal({
            id: overrides?.id ?? other.id,
            planId: overrides?.planId ?? other.planId,
            order: overrides?.order ?? other.order,
            time: overrides?.time ?? other.time,
            name: overrides?.name ?? other.name,
            items: overrides?.items ?? other.items,
            diaryEntries: overrides?.diaryEntries ?? other.diaryEntries,
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static fromJson(json: any): Meal {
        return adapter.fromJson(json);
    }


    toJson() {
        return adapter.toJson(this);
    }
}


class MealAdapter implements Adapter<Meal> {
    fromJson(item: ApiMealType) {
        return new Meal({
            id: item.id,
            planId: item.plan,
            order: item.order,
            time: HHMMToDateTime(item.time),
            name: item.name,
        });
    }

    toJson(item: Meal) {
        return {
            ...(item.id != null ? { id: item.id } : {}),
            plan: item.planId,
            name: item.name,
            order: item.order,
            time: dateTimeToHHMM(item.time)
        };
    }
}

const adapter = new MealAdapter();