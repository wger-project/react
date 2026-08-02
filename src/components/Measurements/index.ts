/**
 * Public surface of the Measurements domain.
 *
 * Other code may only import from `@/components/Measurements`, never from
 * internal sub-paths.
 *
 * Body weight lives here too: it is the user's official body weight category,
 * i.e. measurement data with its own screens (see the plan's locked decision
 * #2), not a domain of its own.
 */
export { BodyWeight } from "./screens/BodyWeight";
export { MeasurementCategoryDetail } from "./screens/MeasurementCategoryDetail";
export { MeasurementCategoryOverview } from "./screens/MeasurementCategoryOverview";

// Models
export {
    categoryDisplayName,
    correlatesWithNutrition,
    limitsFor,
    MeasurementCategory,
    METRIC_TYPE_BODY_WEIGHT
} from "./models/Category";
export { MeasurementEntry } from "./models/Entry";
export { weightUnitOf } from "./models/bodyWeight";

// API endpoints
export {
    API_MEASUREMENTS_CATEGORY_PATH,
    API_MEASUREMENTS_ENTRY_PATH,
    getMeasurementEntries
} from "./api/measurements";

// Query hooks
export {
    useAddMeasurementEntryQuery,
    useDeleteMeasurementEntryQuery,
    useEditMeasurementEntryQuery,
    useMeasurementsCategoryQuery
} from "./queries";
export {
    useBodyWeightCategoryQuery,
    useBodyWeightQuery,
    useDisplayWeightUnit
} from "./queries/bodyWeight";

// Charts
export { componentColor, componentPalette } from "./charts/colors";
export { groupChart, measurementSeries } from "./charts/data";
export { valueWithUnit } from "./charts/format";
export { CHART_RANGES, cutoffFor, DEFAULT_CHART_RANGE, entryFilterFor } from "./charts/range";
export type { ChartRange } from "./charts/range";
export type { PlanPeriod } from "./charts/series";

// Widgets
export { CategoryDetailDataGrid } from "./widgets/CategoryDetailDataGrid";
export { CategoryForm } from "./widgets/CategoryForm";
export { ChartRangeSelector } from "./widgets/ChartRangeSelector";
export { MeasurementChart } from "./widgets/MeasurementChart";
export { MeasurementSeriesChart } from "./widgets/MeasurementSeriesChart";
export { OverallChange } from "./widgets/OverallChange";
export { WeightChart } from "./widgets/WeightChart";
export { WeightForm } from "./widgets/WeightForm";
export { WeightTableDashboard } from "./widgets/WeightTableDashboard";
