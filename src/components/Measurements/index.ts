/**
 * Public surface of the Measurements domain.
 *
 * Other code may only import from `@/components/Measurements`, never from
 * internal sub-paths.
 */
export { MeasurementCategoryDetail } from "./screens/MeasurementCategoryDetail";
export { MeasurementCategoryOverview } from "./screens/MeasurementCategoryOverview";

// Models
export {
    correlatesWithNutrition,
    limitsFor,
    MeasurementCategory,
    METRIC_TYPE_BODY_WEIGHT
} from "./models/Category";
export { MeasurementEntry } from "./models/Entry";

// API endpoints
export {
    API_MEASUREMENTS_CATEGORY_PATH,
    API_MEASUREMENTS_ENTRY_PATH,
    getMeasurementEntries
} from "./api/measurements";

// Query hooks
export { useMeasurementsCategoryQuery } from "./queries";

// Charts
export { componentColor, componentPalette } from "./charts/colors";
export { groupChart, measurementSeries } from "./charts/data";
export { valueWithUnit } from "./charts/format";
export { CHART_RANGES, cutoffFor, DEFAULT_CHART_RANGE, entryFilterFor } from "./charts/range";
export type { ChartRange } from "./charts/range";
export type { PlanPeriod } from "./charts/series";

// Widgets
export { CategoryForm } from "./widgets/CategoryForm";
export { ChartRangeSelector } from "./widgets/ChartRangeSelector";
export { MeasurementChart } from "./widgets/MeasurementChart";
export { MeasurementSeriesChart } from "./widgets/MeasurementSeriesChart";
export { OverallChange } from "./widgets/OverallChange";
