import { WeightEntry } from "./WeightEntry";

describe('WeightEntry', () => {

    test('valueIn converts based on the unit the entry was stored in', () => {
        const kgEntry = new WeightEntry(new Date('2023-01-01'), 80, 'd-1', '', 'kg');
        const lbEntry = new WeightEntry(new Date('2023-01-02'), 90, 'd-2', '', 'lb');

        expect(kgEntry.valueIn('kg')).toBe(80);
        expect(kgEntry.valueIn('lb')).toBe(176.37);
        expect(lbEntry.valueIn('kg')).toBe(40.82);
        expect(lbEntry.valueIn('lb')).toBe(90);
    });

    test('only entries created by the user are editable', () => {
        expect(new WeightEntry(new Date(), 80).isEditable).toBe(true);
        expect(new WeightEntry(new Date(), 80, 'd-1', '', 'kg', 'apple').isEditable).toBe(false);
    });
});
