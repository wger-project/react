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
