import { IngredientImage } from "@/components/Nutrition/models/IngredientImage";
import { IngredientImageThumbnails } from "@/components/Nutrition/models/IngredientImageThumbnails";
import { NutritionWeightUnit, NutritionWeightUnitAdapter } from "@/components/Nutrition/models/weightUnit";
import { ApiIngredientType, NutriScoreValue } from "@/types";
import { Adapter } from "@/core/lib/Adapter";

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
    isVegan?: boolean | null;
    isVegetarian?: boolean | null;
    nutriscore?: NutriScoreValue | null;
    image?: IngredientImage | null;
    thumbnails?: IngredientImageThumbnails | null;
    weightUnits?: NutritionWeightUnit[];
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
    public isVegan: boolean | null;
    public isVegetarian: boolean | null;
    public nutriscore: NutriScoreValue | null;
    public image: IngredientImage | null;
    public thumbnails: IngredientImageThumbnails | null;
    public weightUnits: NutritionWeightUnit[];

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
        this.isVegan = params.isVegan ?? null;
        this.isVegetarian = params.isVegetarian ?? null;
        this.nutriscore = params.nutriscore ?? null;
        this.image = params.image ?? null;
        this.thumbnails = params.thumbnails ?? null;
        this.weightUnits = params.weightUnits ?? [];
    }

    static fromJson(json: ApiIngredientType): Ingredient {
        return adapter.fromJson(json);
    }
}


class IngredientAdapter implements Adapter<Ingredient> {
    fromJson(item: ApiIngredientType) {
        const weightUnitAdapter = new NutritionWeightUnitAdapter();
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
            isVegan: item.is_vegan,
            isVegetarian: item.is_vegetarian,
            nutriscore: item.nutriscore,
            image: item.image === null ? null : IngredientImage.fromJson(item.image),
            thumbnails: item.thumbnails === null ? null : IngredientImageThumbnails.fromJson(item.thumbnails),
            weightUnits: (item.weight_units ?? []).map((u) => weightUnitAdapter.fromJson(u)),
        });
    }
}

const adapter = new IngredientAdapter();