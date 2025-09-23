import { IngredientImage } from "components/Nutrition/models/IngredientImage";
import { IngredientImageThumbnails } from "components/Nutrition/models/IngredientImageThumbnails";
import { ApiIngredientType } from "types";
import { Adapter } from "utils/Adapter";

export type IngredientConstructorParams = {
    id: number;
    uuid: string;
    code: string;
    name: string;
    energy: number;
    protein: number;
    carbohydrates: number;
    carbohydratesSugar: number | null;
    fat: number;
    fatSaturated: number | null;
    fiber: number | null;
    sodium: number | null;
    image?: IngredientImage | null;
    thumbnails?: IngredientImageThumbnails | null;
};

export class Ingredient {

    public id: number;
    public uuid: string;
    public code: string;
    public name: string;
    public energy: number;
    public protein: number;
    public carbohydrates: number;
    public carbohydratesSugar: number | null;
    public fat: number;
    public fatSaturated: number | null;
    public fiber: number | null;
    public sodium: number | null;
    public image: IngredientImage | null;
    public thumbnails: IngredientImageThumbnails | null;

    constructor(params: IngredientConstructorParams) {
        this.id = params.id;
        this.uuid = params.uuid;
        this.code = params.code;
        this.name = params.name;
        this.energy = params.energy;
        this.protein = params.protein;
        this.carbohydrates = params.carbohydrates;
        this.carbohydratesSugar = params.carbohydratesSugar;
        this.fat = params.fat;
        this.fatSaturated = params.fatSaturated;
        this.fiber = params.fiber;
        this.sodium = params.sodium;
        this.image = params.image ?? null;
        this.thumbnails = params.thumbnails ?? null;
    }

    static fromJson(json: ApiIngredientType): Ingredient {
        return adapter.fromJson(json);
    }
}


class IngredientAdapter implements Adapter<Ingredient> {
    fromJson(item: ApiIngredientType) {
        return new Ingredient({
            id: item.id,
            uuid: item.uuid,
            code: item.code,
            name: item.name,
            energy: item.energy,
            protein: parseFloat(item.protein),
            carbohydrates: parseFloat(item.carbohydrates),
            carbohydratesSugar: item.carbohydrates_sugar === null ? null : parseFloat(item.carbohydrates_sugar),
            fat: parseFloat(item.fat),
            fatSaturated: item.fat_saturated === null ? null : parseFloat(item.fat_saturated),
            fiber: item.fiber === null ? null : parseFloat(item.fiber),
            sodium: item.sodium === null ? null : parseFloat(item.sodium),
            image: item.image === null ? null : IngredientImage.fromJson(item.image),
            thumbnails: item.thumbnails === null ? null : IngredientImageThumbnails.fromJson(item.thumbnails),
        });
    }
}

const adapter = new IngredientAdapter();