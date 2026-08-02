import {
    isComponentMetricType,
    isGroupMetricType,
    isSummedPerDay,
    MeasurementCategory,
    metricTypeFromApi
} from "./Category";

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

    test('clone treats a null parentId override as "remove from group"', () => {
        const category = new MeasurementCategory('c-1', 'Systolic', 'mmHg', undefined, 'blood_pressure', false, 'c-parent', 1);

        expect(MeasurementCategory.clone(category).parentId).toBe('c-parent');
        expect(MeasurementCategory.clone(category, { name: 'x' }).parentId).toBe('c-parent');
        expect(MeasurementCategory.clone(category, { parentId: null }).parentId).toBeNull();
        expect(MeasurementCategory.clone(category, { parentId: 'c-other' }).parentId).toBe('c-other');
    });

    test('only cumulative metric types are summed per day', () => {
        expect(isSummedPerDay('steps')).toBe(true);
        expect(isSummedPerDay('distance')).toBe(true);
        expect(isSummedPerDay('energy')).toBe(true);
        expect(isSummedPerDay('sleep')).toBe(true);
        expect(isSummedPerDay('sleep_total')).toBe(true);
        expect(isSummedPerDay('sleep_deep')).toBe(true);

        expect(isSummedPerDay('custom')).toBe(false);
        expect(isSummedPerDay('body_weight')).toBe(false);
        expect(isSummedPerDay('heart_rate')).toBe(false);
        expect(isSummedPerDay('blood_pressure')).toBe(false);
    });

    test('sleep is a group of stage components', () => {
        expect(isGroupMetricType('sleep')).toBe(true);
        expect(isComponentMetricType('sleep_total')).toBe(true);
        expect(isComponentMetricType('sleep_awake')).toBe(true);

        // The group itself is never a component, and a leaf is neither
        expect(isComponentMetricType('sleep')).toBe(false);
        expect(isGroupMetricType('sleep_deep')).toBe(false);
        expect(isGroupMetricType('heart_rate')).toBe(false);
    });
});
