import { Adapter } from "utils/Adapter";
import { ApiIngredientType } from "types";

export class Ingredient {

    constructor(
        public id: number,
        public uuid: string,
        public code: string,
        public name: string,
        public energy: number,
        public protein: number,
        public carbohydrates: number,
        public carbohydratesSugar: number | null,
        public fat: number,
        public fatSaturated: number | null,
        public fibres: number | null,
        public sodium: number | null,
    ) {
    }
}


export class IngredientAdapter implements Adapter<Ingredient> {
    fromJson(item: ApiIngredientType) {
        return new Ingredient(
            item.id,
            item.uuid,
            item.code,
            item.name,
            item.energy,
            parseFloat(item.protein),
            parseFloat(item.carbohydrates),
            item.carbohydrates_sugar === null ? null : parseFloat(item.carbohydrates_sugar),
            parseFloat(item.fat),
            item.fat_saturated === null ? null : parseFloat(item.fat_saturated),
            item.fibres === null ? null : parseFloat(item.fibres),
            item.sodium === null ? null : parseFloat(item.sodium),
        );
    }

    toJson(item: Ingredient): any {
        return {
            id: item.id,
            name: item.name,
            energy: item.energy,
            protein: item.protein,
            carbohydrates: item.carbohydrates,
            // eslint-disable-next-line camelcase
            carbohydrates_sugar: item.carbohydratesSugar,
            fat: item.fat,
            // eslint-disable-next-line camelcase
            fat_saturated: item.fatSaturated,
            fibres: item.fibres,
            sodium: item.sodium,
        };
    }
}