import { Adapter } from "utils/Adapter";
import { ApiNutritionalPlanType } from "types";
import { Meal } from "components/Nutrition/models/meal";
import { DiaryEntry } from "components/Nutrition/models/diaryEntry";
import { NutritionalValues } from "components/Nutrition/helpers/nutritionalValues";

export class NutritionalPlan {

    meals: Meal[] = [];
    diaryEntries: DiaryEntry[] = [];

    constructor(
        public id: number,
        public creationDate: Date,
        public description: string,
    ) {
    }

    get nutritionalValues(): NutritionalValues {
        const out = new NutritionalValues();
        for (const item of this.meals)
            out.add(item.nutritionalValues);

        return out;
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

    toJson(item: NutritionalPlan): any {
        return {
            description: item.description
        };
    }
}