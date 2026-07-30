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

    test('unknown extra_data keys survive the json round trip', () => {
        const entry = WeightEntry.fromJson({
            id: 'd-1',
            date: '2023-01-01T12:00:00Z',
            value: '81.65',

            extra_data: { unit: 'kg', source_unit: 'lb', source_value: '180', device: 'Scale' },
        });

        // the provenance keys are kept, the unit follows the model field
        const cloned = WeightEntry.clone(entry, { unit: 'lb' });
        expect(cloned.toJson().extra_data).toStrictEqual({
            unit: 'lb',

            source_unit: 'lb',

            source_value: '180',
            device: 'Scale',
        });
    });

    test('only entries created by the user are editable', () => {
        expect(new WeightEntry(new Date(), 80).isEditable).toBe(true);
        expect(new WeightEntry(new Date(), 80, 'd-1', '', 'kg', 'apple').isEditable).toBe(false);
    });
});
