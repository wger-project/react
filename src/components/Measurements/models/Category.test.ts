import { MeasurementCategory, metricTypeFromApi } from "./Category";

describe('MeasurementCategory', () => {

    test('fromJson reads the metric type, parent and order', () => {
        const category = MeasurementCategory.fromJson({
            id: 'c-1',
            name: 'Systolic',
            unit: 'mmHg',
            metric_type: 'blood_pressure',
            is_official: false,
            parent: 'c-parent',
            order: 3,
        });

        expect(category.metricType).toBe('blood_pressure');
        expect(category.parentId).toBe('c-parent');
        expect(category.order).toBe(3);
    });

    test('metric type, parent and order survive the json round trip', () => {
        const category = MeasurementCategory.fromJson({
            id: 'c-1',
            name: 'Steps',
            unit: 'steps',
            metric_type: 'steps',
            is_official: false,
            parent: null,
            order: 2,
        });

        const cloned = MeasurementCategory.clone(category, { name: 'Daily steps' });
        expect(cloned.toJson()).toStrictEqual({
            id: 'c-1',
            name: 'Daily steps',
            unit: 'steps',

            metric_type: 'steps',
            parent: null,
            order: 2,
        });
    });

    test('an unknown metric type from the server falls back to custom', () => {
        expect(metricTypeFromApi('brain_waves')).toBe('custom');
        expect(metricTypeFromApi(undefined)).toBe('custom');
        expect(metricTypeFromApi('heart_rate')).toBe('heart_rate');
    });
});
