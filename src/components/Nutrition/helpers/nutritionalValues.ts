type NutritionalValuesConstructor = {
    energy?: number;
    protein?: number;
    carbohydrates?: number;
    carbohydratesSugar?: number;
    fat?: number;
    fatSaturated?: number;
    fibres?: number;
    sodium?: number;
}


export class NutritionalValues {
    energy: number = 0;
    protein: number = 0;
    carbohydrates: number = 0;
    carbohydratesSugar: number = 0;
    fat: number = 0;
    fatSaturated: number = 0;
    fibres: number = 0;
    sodium: number = 0;


    constructor(values?: NutritionalValuesConstructor) {
        this.energy = values?.energy ?? 0;
        this.protein = values?.protein ?? 0;
        this.carbohydrates = values?.carbohydrates ?? 0;
        this.carbohydratesSugar = values?.carbohydratesSugar ?? 0;
        this.fat = values?.fat ?? 0;
        this.fatSaturated = values?.fatSaturated ?? 0;
        this.fibres = values?.fibres ?? 0;
        this.sodium = values?.sodium ?? 0;
    }

    get energyKj(): number {
        return this.energy * 4.184;
    }

    add(data: NutritionalValues) {
        this.energy += data.energy;
        this.protein += data.protein;
        this.carbohydrates += data.carbohydrates;
        this.carbohydratesSugar += data.carbohydratesSugar;
        this.fat += data.fat;
        this.fatSaturated += data.fatSaturated;
        this.fibres += data.fibres;
        this.sodium += data.sodium;
    }

    toString(): string {
        return `e: ${this.energy}, p: ${this.protein}, c: ${this.carbohydrates}, cS: ${this.carbohydratesSugar}, f: ${this.fat}, fS: ${this.fatSaturated}, fi: ${this.fibres}, s: ${this.sodium}`;
    }

    equals(other: NutritionalValues): boolean {
        return (
            this.energy === other.energy &&
            this.protein === other.protein &&
            this.carbohydrates === other.carbohydrates &&
            this.carbohydratesSugar === other.carbohydratesSugar &&
            this.fat === other.fat &&
            this.fatSaturated === other.fatSaturated &&
            this.fibres === other.fibres &&
            this.sodium === other.sodium
        );
    }
}

export type BaseNutritionalValues = {
    protein: number;
    carbohydrates: number;
    fat: number;
}
