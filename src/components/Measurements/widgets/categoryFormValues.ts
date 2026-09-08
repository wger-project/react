import { CHART_LINE_OFF, ChartType, MetricType, TrendCharacter } from "@/components/Measurements/models/Category";

/** What the category form holds, named so that a whole-form update can be typed */
export interface CategoryFormValues {
    name: string;
    unit: string;
    metricType: MetricType;
    chartType: ChartType;
    trend: TrendCharacter;
    averageWindow: number | typeof CHART_LINE_OFF;
    parentId: string;
    calculation: string;
    params: Record<string, unknown>;
}

/** Writes part of the form in one go, validated once as a whole */
export type SetCategoryFormValues = (patch: Partial<CategoryFormValues>) => void;
