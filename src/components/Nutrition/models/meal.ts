import { Adapter } from "utils/Adapter";
import { ApiMealType } from "types";
import { MealItem } from "components/Nutrition/models/mealItem";
import { NutritionalValues } from "components/Nutrition/helpers/nutritionalValues";

export class Meal {

    items: MealItem[] = [];

    constructor(
        public id: number,
        public order: number,
        public time: string,
        public name: string
    ) {
    }

    get nutritionalValues(): NutritionalValues {
        const out = new NutritionalValues();
        for (const item of this.items)
            out.add(item.nutritionalValues);

        return out;
    }
}


export class MealAdapter implements Adapter<Meal> {
    fromJson(item: ApiMealType) {
        return new Meal(
            item.id,
            item.order,
            item.time,
            item.name,
        );
    }

    toJson(item: Meal) {
        return {
            name: item.name,
            order: item.order,
            time: item.time
        };
    }
}