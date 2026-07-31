import { MeasurementEntry } from "./Entry";

describe('MeasurementEntry', () => {

    test('extra_data survives the json round trip', () => {
        const entry = MeasurementEntry.fromJson({
            id: 'd-1',
            category: 'c-1',
            date: '2023-01-01T12:00:00Z',
            value: 42,
            notes: '',
            source: 'apple',
            extra_data: { unit: 'bpm', device: 'Watch' },
        });

        const cloned = MeasurementEntry.clone(entry, { value: 43 });
        expect(cloned.source).toBe('apple');
        expect(cloned.toJson()).toStrictEqual({
            id: 'd-1',
            category: 'c-1',
            date: '2023-01-01T12:00:00.000Z',
            value: 43,
            notes: '',

            extra_data: { unit: 'bpm', device: 'Watch' },
        });
    });

    test('missing extra_data defaults to an empty object', () => {
        const entry = MeasurementEntry.fromJson({
            id: 'd-1',
            category: 'c-1',
            date: '2023-01-01T12:00:00Z',
            value: 42,
            notes: '',
        });

        expect(entry.extraData).toStrictEqual({});
        expect(entry.source).toBe('user');
    });
});

describe('MeasurementEntry units', () => {

    const entry = (value: number, extraData: Record<string, unknown> = {}) =>
        new MeasurementEntry('d-1', 'c-1', new Date(2023, 1, 1), value, '', 'user', extraData);

    test('falls back to the category unit when extra_data has none', () => {
        expect(entry(80).unitOrFallback('kg')).toBe('kg');
        expect(entry(80, { unit: '' }).unitOrFallback('kg')).toBe('kg');
        expect(entry(80, { unit: 42 }).unitOrFallback('kg')).toBe('kg');
    });

    test('converts a value stored in another unit', () => {
        expect(entry(176.37, { unit: 'lb' }).valueIn('kg', 'kg')).toBe(80);
        expect(entry(80, { unit: 'kg' }).valueIn('lb', 'kg')).toBe(176.37);
    });

    test('leaves free-form category units untouched', () => {
        expect(entry(42).valueIn('cm', 'cm')).toBe(42);
        expect(entry(42, { unit: 'cm' }).valueIn('kg', 'cm')).toBe(42);
    });

    test('bounds follow the value through the same conversion', () => {
        const aggregate = entry(80, { unit: 'lb', min: 70, max: 90 });

        expect(aggregate.boundIn(70, 'kg', 'kg')).toBe(31.75);
        expect(aggregate.boundIn(90, 'kg', 'kg')).toBe(40.82);
    });
});
