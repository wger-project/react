import { MeasurementEntry } from "@/components/Measurements/models/Entry";
import { Adapter } from "@/core/lib/Adapter";

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
 * One component of a group, e.g. systolic. Components exist only as the
 * children of their group, which the server creates them with, so they are
 * never offered when creating a category.
 */
export function isComponentMetricType(type: MetricType): boolean {
    return Object.values(GROUP_COMPONENTS).some(components => components.includes(type));
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
    ) {
        if (entries) {
            this.entries = entries;
        }
    }

    get isGroup(): boolean {
        return this.children.length > 0;
    }

    static clone(other: MeasurementCategory, overrides?: Partial<Pick<MeasurementCategory, 'id' | 'name' | 'unit' | 'metricType' | 'parentId'>>): MeasurementCategory {
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
        );
    }

    toJson(item: MeasurementCategory) {
        return {
            ...(item.id != null ? { id: item.id } : {}),
            name: item.name,
            unit: item.unit,
            // eslint-disable-next-line camelcase
            metric_type: item.metricType,
            parent: item.parentId,
            order: item.order,
        };
    }
}

const adapter = new MeasurementCategoryAdapter();
