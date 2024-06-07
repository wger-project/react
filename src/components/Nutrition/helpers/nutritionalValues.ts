import { Ingredient } from "components/Nutrition/models/Ingredient";
import { NutritionWeightUnit } from "components/Nutrition/models/weightUnit";

type NutritionalValuesConstructor = {
    energy?: number;
    protein?: number;
    carbohydrates?: number;
    carbohydratesSugar?: number;
    fat?: number;
    fatSaturated?: number;
    fiber?: number;
    sodium?: number;
    bodyWeight?: number;
}

// in kcal per g
export const ENERGY_FACTOR = {
    protein: 4,
    carbohydrates: 4,
    fat: 9
};

export class NutritionalValues {
    bodyWeight: number = 0;

    energy: number = 0;
    protein: number = 0;
    carbohydrates: number = 0;
    carbohydratesSugar: number = 0;
    fat: number = 0;
    fatSaturated: number = 0;
    fiber: number = 0;
    sodium: number = 0;

    get energyKj(): number {
        return this.energy * 4.184;
    }

    get isEmpty(): boolean {
        return this.energy === 0 && this.protein === 0 && this.carbohydrates === 0 && this.fat === 0;
    }

    get percent() {
        return {
            protein: this.protein > 0 ? this.protein * ENERGY_FACTOR.protein / this.energy * 100 : 0,
            carbohydrates: this.carbohydrates > 0 ? this.carbohydrates * ENERGY_FACTOR.carbohydrates / this.energy * 100 : 0,
            fat: this.fat > 0 ? this.fat * ENERGY_FACTOR.fat / this.energy * 100 : 0
        };
    }

    get perBodyKg() {
        return {
            protein: this.bodyWeight > 0 ? this.protein / this.bodyWeight : 0,
            carbohydrates: this.bodyWeight > 0 ? this.carbohydrates / this.bodyWeight : 0,
            fat: this.bodyWeight > 0 ? this.fat / this.bodyWeight : 0,
        };
    };


    constructor(values?: NutritionalValuesConstructor) {
        this.energy = values?.energy ?? 0;
        this.protein = values?.protein ?? 0;
        this.carbohydrates = values?.carbohydrates ?? 0;
        this.carbohydratesSugar = values?.carbohydratesSugar ?? 0;
        this.fat = values?.fat ?? 0;
        this.fatSaturated = values?.fatSaturated ?? 0;
        this.fiber = values?.fiber ?? 0;
        this.sodium = values?.sodium ?? 0;
        this.bodyWeight = values?.bodyWeight ?? 0;
    }

    static fromIngredient(ingredient: Ingredient, amount: number, weightUnit: NutritionWeightUnit | null) {
        const out = new NutritionalValues();

        const weight = weightUnit === null
            ? amount
            : amount * weightUnit.amount * weightUnit.grams;

        // divide by 100 because nutrition values are per 100g
        out.energy = ingredient.energy * weight / 100;
        out.protein = ingredient.protein * weight / 100;
        out.carbohydrates = ingredient.carbohydrates * weight / 100;
        out.carbohydratesSugar = ingredient.carbohydratesSugar ? ingredient.carbohydratesSugar * weight / 100 : 0;
        out.fat = ingredient.fat * weight / 100;
        out.fatSaturated = ingredient.fatSaturated ? ingredient.fatSaturated * weight / 100 : 0;
        out.fiber = ingredient.fiber ? ingredient.fiber * weight / 100 : 0;
        out.sodium = ingredient.sodium ? ingredient.sodium * weight / 100 : 0;

        return out;
    }


    add(other: NutritionalValues) {
        this.energy += other.energy;
        this.protein += other.protein;
        this.carbohydrates += other.carbohydrates;
        this.carbohydratesSugar += other.carbohydratesSugar;
        this.fat += other.fat;
        this.fatSaturated += other.fatSaturated;
        this.fiber += other.fiber;
        this.sodium += other.sodium;

        return this;
    }

    toString(): string {
        return `e: ${this.energy}, p: ${this.protein}, c: ${this.carbohydrates}, cS: ${this.carbohydratesSugar}, f: ${this.fat}, fS: ${this.fatSaturated}, fi: ${this.fiber}, s: ${this.sodium}`;
    }

    equals(other: NutritionalValues): boolean {
        return (
            this.energy === other.energy &&
            this.protein === other.protein &&
            this.carbohydrates === other.carbohydrates &&
            this.carbohydratesSugar === other.carbohydratesSugar &&
            this.fat === other.fat &&
            this.fatSaturated === other.fatSaturated &&
            this.fiber === other.fiber &&
            this.sodium === other.sodium
        );
    }
}

export type BaseNutritionalValues = {
    protein: number;
    carbohydrates: number;
    fat: number;
}
