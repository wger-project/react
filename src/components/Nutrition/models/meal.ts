import { Adapter } from "utils/Adapter";
import { ApiMealType } from "types";

export class Meal {

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