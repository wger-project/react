import {
    availableChartTypes,
    averageWindowOf,
    binWidthFor,
    categoryDisplayName,
    isComponentMetricType,
    isGroupMetricType,
    isSummedPerDay,
    limitsFor,
    MEASUREMENT_SCHEMA_MAX_VALUE,
    MeasurementCategory,
    metricTypeFromApi,
    resolveChartType,
    TrendCharacter,
    trendOf,
    trendPeriodOf
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
            chart_type: null,
            chart_config: {},
            parent: null,
            order: 2,
            dynamic_type: 'NONE',
            dynamic_params: {},
        });
    });

    test('the calculation survives the json round trip', () => {
        const category = MeasurementCategory.fromJson({
            id: 'c-1',
            name: 'Waist to height',
            unit: '',
            metric_type: 'custom',
            is_official: false,
            dynamic_type: 'WHTR',
            dynamic_params: { category_id: 'c-waist' },
        });

        expect(category.isCalculated).toBe(true);
        expect(MeasurementCategory.clone(category).toJson()).toMatchObject({
            dynamic_type: 'WHTR',
            dynamic_params: { category_id: 'c-waist' },
        });
    });

    test('a category the server does not calculate is not calculated', () => {
        const category = MeasurementCategory.fromJson({
            id: 'c-1',
            name: 'Biceps',
            unit: 'cm',
            metric_type: 'custom',
            is_official: false,
        });

        expect(category.dynamicType).toBe('NONE');
        expect(category.isCalculated).toBe(false);
    });

    test('a calculation added after this release still reads as calculated', () => {
        const category = MeasurementCategory.fromJson({
            id: 'c-1',
            name: 'Something new',
            unit: '',
            metric_type: 'custom',
            is_official: false,
            dynamic_type: 'FUTURE_TYPE',
        });

        expect(category.isCalculated).toBe(true);
    });

    test('an unknown metric type from the server falls back to custom', () => {
        expect(metricTypeFromApi('brain_waves')).toBe('custom');
        expect(metricTypeFromApi(undefined)).toBe('custom');
        expect(metricTypeFromApi('heart_rate')).toBe('heart_rate');
    });

    test('clone treats a null parentId override as "remove from group"', () => {
        const category = new MeasurementCategory('c-1', 'Systolic', 'mmHg', 'blood_pressure', false, 'c-parent', 1);

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

    test('value limits are per unit for body weight only', () => {
        expect(limitsFor('body_weight', 'kg').max).toBe(350);
        expect(limitsFor('body_weight', 'lb').max).toBe(770);

        // every other type has one unit, so the argument changes nothing
        expect(limitsFor('heart_rate', 'bpm').max).toBe(limitsFor('heart_rate').max);
    });

    test('value limits of the components differ from each other', () => {
        expect(limitsFor('blood_pressure_systolic').max).toBe(250);
        expect(limitsFor('blood_pressure_diastolic').max).toBe(150);
    });

    test('an untyped category is only bounded by the column itself', () => {
        expect(limitsFor('custom')).toEqual({ min: 0, max: MEASUREMENT_SCHEMA_MAX_VALUE });
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

    describe('chart type', () => {

        test('fromJson reads the null the server sends as no override', () => {
            const category = MeasurementCategory.fromJson({
                id: 'c-1',
                name: 'Steps',
                unit: 'steps',
                metric_type: 'steps',
                chart_type: null,
            });

            expect(category.chartType).toBe('auto');
        });

        test('fromJson falls back to auto for a type this release does not know', () => {
            const category = MeasurementCategory.fromJson({
                id: 'c-1', name: 'Steps', unit: 'steps', chart_type: 'sunburst',
            });

            expect(category.chartType).toBe('auto');
        });

        test('toJson sends no override as null', () => {
            const category = new MeasurementCategory('c-1', 'Steps', 'steps');

            expect(category.toJson().chart_type).toBeNull();
        });

        test('toJson sends the picked type', () => {
            const category = new MeasurementCategory(
                'c-1', 'Steps', 'steps', 'steps', false, null, 0, 'heatmap',
            );

            expect(category.toJson().chart_type).toBe('heatmap');
        });

        test('clone carries the chart type over and can override it', () => {
            const category = new MeasurementCategory(
                'c-1', 'Steps', 'steps', 'steps', false, null, 0, 'heatmap',
            );

            expect(MeasurementCategory.clone(category).chartType).toBe('heatmap');
            expect(MeasurementCategory.clone(category, { chartType: 'auto' }).chartType)
                .toBe('auto');
        });

        test('the offered types follow the metric type', () => {
            expect(availableChartTypes('steps'))
                .toEqual(['bar', 'heatmap', 'delta', 'distribution']);
            expect(availableChartTypes('custom'))
                .toEqual(['line', 'heatmap', 'delta', 'distribution']);

            // a group is drawn by what its components are to each other
            expect(availableChartTypes('blood_pressure')).toEqual([]);
        });

        test('a type that does not fit falls back to the derived chart', () => {
            expect(resolveChartType('custom', 'bar')).toBe('line');
            expect(resolveChartType('steps', 'line')).toBe('bar');
            expect(resolveChartType('custom', 'auto')).toBe('line');
        });

        test('a type that fits is kept', () => {
            expect(resolveChartType('custom', 'heatmap')).toBe('heatmap');
            expect(resolveChartType('steps', 'bar')).toBe('bar');
            expect(resolveChartType('body_weight', 'delta')).toBe('delta');
            expect(resolveChartType('resting_heart_rate', 'distribution')).toBe('distribution');
        });
    });

    describe('chart config', () => {

        test('an unconfigured category gets the defaults', () => {
            expect(trendOf({})).toBe('balanced');
            expect(averageWindowOf({})).toBe(7);
        });

        test('reads what was configured', () => {
            expect(trendOf({ trend: 'sluggish' })).toBe('sluggish');
            expect(averageWindowOf({ average_window: 30 })).toBe(30);
        });

        test('a value this release does not know falls back to the default', () => {
            expect(trendOf({ trend: 'glacial' as TrendCharacter })).toBe('balanced');
            expect(averageWindowOf({ average_window: 21 })).toBe(7);
            expect(averageWindowOf({ average_window: 'a fortnight' as unknown as number })).toBe(7);
        });

        test('the trend character maps to the EMA period the chart uses', () => {
            expect(trendPeriodOf({ trend: 'reactive' })!)
                .toBeLessThan(trendPeriodOf({ trend: 'balanced' })!);
            expect(trendPeriodOf({ trend: 'sluggish' })!)
                .toBeGreaterThan(trendPeriodOf({ trend: 'balanced' })!);
        });

        test('a line the user turned off has no period and no window', () => {
            expect(trendPeriodOf({ trend: 'none' })).toBeNull();
            expect(averageWindowOf({ average_window: 'none' })).toBeNull();
        });

        test('turning one line off leaves the other alone', () => {
            expect(averageWindowOf({ trend: 'none', average_window: 14 })).toBe(14);
            expect(trendPeriodOf({ trend: 'reactive', average_window: 'none' })).not.toBeNull();
        });

        test('a setting is changed without dropping the keys of another client', () => {
            const category = new MeasurementCategory('c-1', 'Biceps', 'cm');
            category.chartConfig = { goal_line: 75 };

            expect(category.withChartSetting('trend', 'reactive').chartConfig)
                .toEqual({ goal_line: 75, trend: 'reactive' });
        });

        test('fromJson ignores a configuration that is not an object', () => {
            const category = MeasurementCategory.fromJson({
                id: 'c-1', name: 'Steps', unit: 'steps', chart_config: null,
            });

            expect(category.chartConfig).toEqual({});
        });
    });

    describe('binWidthFor', () => {

        test('body weight follows the unit, like its limits do', () => {
            expect(binWidthFor('body_weight', 'kg')).toBe(0.5);
            expect(binWidthFor('body_weight', 'lb')).toBe(1);
        });

        test('the typed metrics carry a fixed width', () => {
            expect(binWidthFor('resting_heart_rate')).toBe(1);
            expect(binWidthFor('steps')).toBe(1000);
            expect(binWidthFor('sleep_total')).toBe(30);
        });

        test('free-form categories and groups have none, theirs follows the data', () => {
            expect(binWidthFor('custom')).toBeUndefined();
            expect(binWidthFor('blood_pressure')).toBeUndefined();
        });
    });

    describe('categoryDisplayName', () => {

        // the tests' t() returns the key it is given
        const t = ((key: string) => key) as never;

        test('a typed category is named after its metric type', () => {
            const category = new MeasurementCategory(
                'c-1', 'Blutdruck', 'mmHg', 'blood_pressure_systolic',
            );

            expect(categoryDisplayName(category, t))
                .toBe('measurements.metricTypes.blood_pressure_systolic');
        });

        test('a free-form category keeps the name the user gave it', () => {
            const category = new MeasurementCategory('c-1', 'Bizeps', 'cm');

            expect(categoryDisplayName(category, t)).toBe('Bizeps');
        });
    });
});
