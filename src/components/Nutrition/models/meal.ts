import { Adapter } from "utils/Adapter";
import { ApiMealType } from "types";
import { MealItem } from "components/Nutrition/models/mealItem";

export class Meal {

    items: MealItem[] = [];
    
    constructor(
        public id: number,
        public order: number,
        public time: string,
        public name: string
    ) {
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

    toJson(item: Meal): any {
        return {
            name: item.name,
            order: item.order,
            time: item.time
        };
    }
}