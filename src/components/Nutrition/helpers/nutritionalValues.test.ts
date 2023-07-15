import { NutritionalValues } from "components/Nutrition/helpers/nutritionalValues";

describe('NutritionalValues', () => {
    it('should add nutritional values correctly', () => {
        const values1 = new NutritionalValues();
        values1.energy = 100;
        values1.protein = 10;
        values1.carbohydrates = 20;
        values1.fat = 5;

        const values2 = new NutritionalValues();
        values2.energy = 50;
        values2.protein = 5;
        values2.carbohydrates = 10;
        values2.fat = 2;

        values1.add(values2);

        expect(values1.energy).toBe(150);
        expect(values1.protein).toBe(15);
        expect(values1.carbohydrates).toBe(30);
        expect(values1.fat).toBe(7);
    });

    it('should calculate energy in kJ correctly', () => {
        const values = new NutritionalValues();
        values.energy = 500;

        expect(values.energyKj).toBe(2092);
    });

    it('should compare nutritional values correctly', () => {
        const values1 = new NutritionalValues();
        values1.energy = 100;
        values1.protein = 10;
        values1.carbohydrates = 20;
        values1.fat = 5;

        const values2 = new NutritionalValues();
        values2.energy = 100;
        values2.protein = 10;
        values2.carbohydrates = 20;
        values2.fat = 5;

        const values3 = new NutritionalValues();
        values3.energy = 200;
        values3.protein = 20;
        values3.carbohydrates = 40;
        values3.fat = 10;

        expect(values1.equals(values2)).toBe(true);
        expect(values1.equals(values3)).toBe(false);
    });

    it('should have correct string representation', () => {
        const values = new NutritionalValues();
        values.energy = 100;
        values.protein = 10;
        values.carbohydrates = 20;
        values.fat = 5;

        const expectedString = 'e: 100, p: 10, c: 20, cS: 0, f: 5, fS: 0, fi: 0, s: 0';

        expect(values.toString()).toBe(expectedString);
    });
});
