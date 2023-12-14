import { NutritionalValues } from "components/Nutrition/helpers/nutritionalValues";

describe('NutritionalValues', () => {
    test('should add nutritional values correctly', () => {
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

    test('should calculate energy in kJ correctly', () => {
        const values = new NutritionalValues();
        values.energy = 500;

        expect(values.energyKj).toBe(2092);
    });

    test('should compare nutritional values correctly', () => {
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

    test('should have correct string representation', () => {
        const values = new NutritionalValues();
        values.energy = 100;
        values.protein = 10;
        values.carbohydrates = 20;
        values.fat = 5;

        const expectedString = 'e: 100, p: 10, c: 20, cS: 0, f: 5, fS: 0, fi: 0, s: 0';

        expect(values.toString()).toBe(expectedString);
    });

    test('the percentage calculations work correctly', () => {
        // protein 4 kcal per g
        // carbohydrates 4 kcal per g
        // fat 9 kcal per g

        const values = new NutritionalValues({
            energy: 165,
            protein: 10,
            carbohydrates: 20,
            fat: 5
        });

        expect(values.percent.protein).toBeCloseTo(24.24, 2);
        expect(values.percent.carbohydrates).toBeCloseTo(48.4848, 2);
        expect(values.percent.fat).toBeCloseTo(27.2727, 2);
    });

    test('the g-per-body-kg is correctly calculated', () => {
        const values = new NutritionalValues({
            protein: 150,
            carbohydrates: 200,
            fat: 50,
            bodyWeight: 100
        });

        expect(values.perBodyKg.protein).toBeCloseTo(1.5, 2);
        expect(values.perBodyKg.carbohydrates).toBeCloseTo(2, 2);
        expect(values.perBodyKg.fat).toBeCloseTo(0.5, 2);
    });

    test('the g-per-body-kg correctly handles no known weight', () => {
        const values = new NutritionalValues({
            protein: 150,
            carbohydrates: 200,
            fat: 50,
        });

        expect(values.perBodyKg.protein).toBeCloseTo(0, 2);
        expect(values.perBodyKg.carbohydrates).toBeCloseTo(0, 2);
        expect(values.perBodyKg.fat).toBeCloseTo(0, 2);
    });
});
