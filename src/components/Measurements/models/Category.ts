import { MeasurementEntry } from "@/components/Measurements/models/Entry";
import { Adapter } from "@/core/lib/Adapter";

/** Semantic category types, the values mirror the Django MetricType choices */
export const METRIC_TYPES = [
    'custom',
    'body_weight',
    'body_fat',
    'height',
    'blood_pressure',
    'heart_rate',
    'steps',
    'distance',
    'energy',
    'sleep',
] as const;
export type MetricType = typeof METRIC_TYPES[number];

/** Server-side MetricType value marking a category as holding body weight data */
export const METRIC_TYPE_BODY_WEIGHT: MetricType = 'body_weight';

/** Narrows a server value to a known metric type, unknown values fall back to 'custom' */
export function metricTypeFromApi(value: unknown): MetricType {
    return METRIC_TYPES.includes(value as MetricType) ? value as MetricType : 'custom';
}

export class MeasurementCategory {

    entries: MeasurementEntry[] = [];

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

    static clone(other: MeasurementCategory, overrides?: Partial<Pick<MeasurementCategory, 'id' | 'name' | 'unit'>>): MeasurementCategory {
        return new MeasurementCategory(
            overrides?.id ?? other.id,
            overrides?.name ?? other.name,
            overrides?.unit ?? other.unit,
            other.entries,
            other.metricType,
            other.isOfficial,
            other.parentId,
            other.order,
        );
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
