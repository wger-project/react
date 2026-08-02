import { MeasurementEntry } from "@/components/Measurements/models/Entry";
import { TFunction } from "i18next";
import { Adapter } from "@/core/lib/Adapter";
import { isWeightUnit, WeightUnit } from "@/core/lib/weightUnit";

/** Semantic category types, the values mirror the Django MetricType choices */
export const METRIC_TYPES = [
    'custom',
    'body_weight',
    'body_fat',
    'height',
    'blood_pressure',
    'blood_pressure_systolic',
    'blood_pressure_diastolic',
    'heart_rate',
    'resting_heart_rate',
    'steps',
    'distance',
    'energy',
    'sleep',
    'sleep_total',
    'sleep_light',
    'sleep_deep',
    'sleep_rem',
    'sleep_awake',
] as const;
export type MetricType = typeof METRIC_TYPES[number];

/** Server-side MetricType value marking a category as holding body weight data */
export const METRIC_TYPE_BODY_WEIGHT: MetricType = 'body_weight';

/**
 * The chart a category is drawn as.
 *
 * The values mirror the Django ChartType choices, where the override is a
 * nullable column: 'auto' is that null, i.e. "derive the chart from the metric
 * type", which is what every category does unless the user picked something
 * else. Only the shapes that are a matter of taste are offered; a floating bar
 * (two components) and a stacked bar (a summed group) follow from what the
 * group is and are not choices.
 */
export const CHART_TYPES = ['auto', 'line', 'bar', 'heatmap'] as const;
export type ChartType = typeof CHART_TYPES[number];

/**
 * Narrows a server value to a known chart type. Null is the server's "no
 * override"; an unrecognised value is one added after this release, and
 * falling back to 'auto' is what keeps such a category readable here.
 */
export function chartTypeFromApi(value: unknown): ChartType {
    return CHART_TYPES.includes(value as ChartType) ? value as ChartType : 'auto';
}

/**
 * Name to show the user for a category.
 *
 * A typed category is created by the server or by the health importer and
 * carries an English name ("Systolic", "Deep sleep"), while its metric type
 * already has a translated label. Only a free-form category holds a name the
 * user picked themselves.
 */
export function categoryDisplayName(
    category: { name: string, metricType: MetricType },
    t: TFunction,
): string {
    return category.metricType === 'custom'
        ? category.name
        : t(`measurements.metricTypes.${category.metricType}`);
}

/** Narrows a server value to a known metric type, unknown values fall back to 'custom' */
export function metricTypeFromApi(value: unknown): MetricType {
    return METRIC_TYPES.includes(value as MetricType) ? value as MetricType : 'custom';
}

/**
 * Metric types whose individual samples aren't meaningful on their own:
 * they are summed per day and charted as bars instead of a line
 */
export function isSummedPerDay(type: MetricType): boolean {
    return type === 'steps'
        || type === 'distance'
        || type === 'energy'
        || type === 'sleep'
        || type === 'sleep_total'
        || type === 'sleep_light'
        || type === 'sleep_deep'
        || type === 'sleep_rem'
        || type === 'sleep_awake';
}

/**
 * The chart a category of this metric type is drawn as when the user picked
 * none.
 *
 * Summed types are one value per day and are drawn as that day's bar,
 * everything else is a series of samples and gets the line chart. A group has
 * no default here: its chart follows from what its components are to each
 * other, see groupChart.
 */
export function defaultChartType(type: MetricType): ChartType {
    return isSummedPerDay(type) ? 'bar' : 'line';
}

/**
 * The chart types a category of this metric type may be drawn as, i.e. what
 * the picker offers on top of 'auto'.
 *
 * The heatmap is the one alternative that fits every leaf type: it answers how
 * regularly rather than how much, and it is the only chart of the set where a
 * missing day is visible instead of being spanned by a line. A group is left
 * out, its chart is structural rather than a preference.
 */
export function availableChartTypes(type: MetricType): ChartType[] {
    return isGroupMetricType(type) ? [] : [defaultChartType(type), 'heatmap'];
}

/**
 * The chart a category of this metric type is drawn as, given what the user
 * picked.
 *
 * A pick that does not fit the type falls back to the derived default instead
 * of being refused: the server stores the string without judging it, so this is
 * also what keeps a category configured on another client from showing nothing
 * here.
 */
export function resolveChartType(type: MetricType, picked: ChartType): ChartType {
    return availableChartTypes(type).includes(picked) ? picked : defaultChartType(type);
}

/**
 * Metric types whose charts show nutrition plan periods for context. Custom
 * categories are typically hand-kept body measurements (waist, biceps), so
 * they qualify; the typed health metrics do not.
 */
export function correlatesWithNutrition(type: MetricType): boolean {
    return type === 'body_weight' || type === 'body_fat' || type === 'custom';
}

/**
 * Metric types reserved for the official categories the server manages:
 * users cannot create categories of these types
 */
export function isOfficialMetricType(type: MetricType): boolean {
    return type === METRIC_TYPE_BODY_WEIGHT;
}

/**
 * The components of the multi-value metric types, in group order. Mirrors
 * GROUP_COMPONENTS on the server, which is what creates these categories.
 */
export const GROUP_COMPONENTS: Partial<Record<MetricType, MetricType[]>> = {
    // eslint-disable-next-line camelcase
    blood_pressure: ['blood_pressure_systolic', 'blood_pressure_diastolic'],
    // The total is a component of its own because a group carries no
    // measurements. It is not the sum of the three stages next to it: platforms
    // also report sleep without a stage breakdown, which counts towards the
    // total and has no stage category to live in
    sleep: ['sleep_total', 'sleep_light', 'sleep_deep', 'sleep_rem', 'sleep_awake'],
};

/**
 * A container type whose readings live in its components, e.g. blood pressure.
 * A group category never carries entries of its own.
 */
export function isGroupMetricType(type: MetricType): boolean {
    return type in GROUP_COMPONENTS;
}

/**
 * Largest value the server's column can hold (numeric(8, 2)). It is what a
 * category without a metric type is bounded by, since nothing about a free-form
 * category says more.
 */
export const MEASUREMENT_SCHEMA_MAX_VALUE = 999999.99;

/**
 * The range a measurement value of one metric type may be in. min/max are what
 * the API enforces, a value outside them comes back as a 400; softMin/softMax
 * are the everyday range, meant for warnings and chart axes, and are enforced
 * nowhere.
 */
export interface MetricLimits {
    min: number;
    max: number;
    softMin?: number;
    softMax?: number;
}

/**
 * The bounds per metric type, in the unit the type is stored in.
 *
 * MUST stay identical to METRIC_LIMITS on the server. Bounds may be widened
 * over releases, never tightened: a client that still knows the wider one would
 * write values the server then rejects permanently.
 */
/* eslint-disable camelcase */
const METRIC_LIMITS: Partial<Record<MetricType, MetricLimits>> = {
    body_fat: { min: 2, max: 60, softMin: 5, softMax: 50 },
    height: { min: 50, max: 250, softMin: 140, softMax: 210 },
    blood_pressure_systolic: { min: 50, max: 250, softMin: 90, softMax: 180 },
    blood_pressure_diastolic: { min: 30, max: 150, softMin: 50, softMax: 110 },
    heart_rate: { min: 30, max: 250, softMin: 40, softMax: 200 },
    resting_heart_rate: { min: 30, max: 120, softMin: 40, softMax: 100 },
    // The cumulative types hold a whole day, and a rest day really is 0 steps
    steps: { min: 0, max: 100000, softMin: 0, softMax: 30000 },
    distance: { min: 0, max: 500, softMin: 0, softMax: 30 },
    energy: { min: 0, max: 10000, softMin: 0, softMax: 2000 },
    // Sleep is stored in minutes, so the upper bound is not a rarity but
    // arithmetic: a day has 1440 of them
    sleep_total: { min: 0, max: 1440, softMin: 180, softMax: 720 },
    sleep_light: { min: 0, max: 1440, softMin: 0, softMax: 720 },
    sleep_deep: { min: 0, max: 1440, softMin: 0, softMax: 720 },
    sleep_rem: { min: 0, max: 1440, softMin: 0, softMax: 720 },
    sleep_awake: { min: 0, max: 1440, softMin: 0, softMax: 720 },
};
/* eslint-enable camelcase */

/** Body weight is the only metric whose values come in more than one unit */
const BODY_WEIGHT_LIMITS: Record<WeightUnit, MetricLimits> = {
    kg: { min: 20, max: 350, softMin: 30, softMax: 300 },
    lb: { min: 44, max: 770, softMin: 66, softMax: 661 },
};

/**
 * The range a value in a category of this metric type may be in. Free-form
 * categories, and the group containers that carry no entries at all, are only
 * bounded by the column itself.
 */
export function limitsFor(type: MetricType, unit?: string): MetricLimits {
    if (type === METRIC_TYPE_BODY_WEIGHT) {
        return BODY_WEIGHT_LIMITS[isWeightUnit(unit) ? unit : 'kg'];
    }

    return METRIC_LIMITS[type] ?? { min: 0, max: MEASUREMENT_SCHEMA_MAX_VALUE };
}

/**
 * One component of a group, e.g. systolic. Components exist only as the
 * children of their group, which the server creates them with, so they are
 * never offered when creating a category.
 */
export function isComponentMetricType(type: MetricType): boolean {
    return Object.values(GROUP_COMPONENTS).some(components => components.includes(type));
}

/**
 * The component that rolls its siblings up instead of being one part next to
 * them. Total sleep already covers the stages beside it, so a stacked chart
 * has to leave it out or it counts every night twice.
 */
export function isGroupTotalMetricType(type: MetricType): boolean {
    return type === 'sleep_total';
}

export class MeasurementCategory {

    entries: MeasurementEntry[] = [];

    /**
     * Child categories (components) of a multi-value group such as blood
     * pressure. Populated by the API layer for display, never persisted
     * directly; only leaf categories carry entries.
     */
    children: MeasurementCategory[] = [];

    constructor(
        public id: string | null,
        public name: string,
        public unit: string,
        entries?: MeasurementEntry[],
        public metricType: MetricType = 'custom',
        public isOfficial: boolean = false,
        public parentId: string | null = null,
        public order: number = 0,
        /** Chart the user picked, 'auto' (the server's null) for the derived one */
        public chartType: ChartType = 'auto',
    ) {
        if (entries) {
            this.entries = entries;
        }
    }

    get isGroup(): boolean {
        return this.children.length > 0;
    }

    static clone(other: MeasurementCategory, overrides?: Partial<Pick<MeasurementCategory, 'id' | 'name' | 'unit' | 'metricType' | 'parentId' | 'chartType'>>): MeasurementCategory {
        const category = new MeasurementCategory(
            overrides?.id ?? other.id,
            overrides?.name ?? other.name,
            overrides?.unit ?? other.unit,
            other.entries,
            overrides?.metricType ?? other.metricType,
            other.isOfficial,
            // null is a meaningful override here (remove from group), so the
            // usual ?? fallback doesn't work
            overrides !== undefined && 'parentId' in overrides ? overrides.parentId ?? null : other.parentId,
            other.order,
            overrides?.chartType ?? other.chartType,
        );
        category.children = other.children;
        return category;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static fromJson(json: any): MeasurementCategory {
        return adapter.fromJson(json);
    }

    toJson() {
        return adapter.toJson(this);
    }
}


class MeasurementCategoryAdapter implements Adapter<MeasurementCategory> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fromJson(item: any) {
        return new MeasurementCategory(
            item.id,
            item.name,
            item.unit,
            undefined,
            metricTypeFromApi(item.metric_type),
            item.is_official,
            item.parent ?? null,
            item.order ?? 0,
            chartTypeFromApi(item.chart_type),
        );
    }

    toJson(item: MeasurementCategory) {
        return {
            ...(item.id != null ? { id: item.id } : {}),
            name: item.name,
            unit: item.unit,
            // eslint-disable-next-line camelcase
            metric_type: item.metricType,
            // The column is nullable, and null is what makes the server derive
            // the chart from the metric type
            // eslint-disable-next-line camelcase
            chart_type: item.chartType === 'auto' ? null : item.chartType,
            parent: item.parentId,
            order: item.order,
        };
    }
}

const adapter = new MeasurementCategoryAdapter();
