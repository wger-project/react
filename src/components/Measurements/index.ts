/**
 * Public surface of the Measurements domain.
 *
 * Other code may only import from `@/components/Measurements`, never from
 * internal sub-paths.
 */
export { MeasurementCategoryDetail } from "./screens/MeasurementCategoryDetail";
export { MeasurementCategoryOverview } from "./screens/MeasurementCategoryOverview";

// Models
export { MeasurementCategory, METRIC_TYPE_BODY_WEIGHT } from "./models/Category";
export { MeasurementEntry } from "./models/Entry";

// API endpoints
export { API_MEASUREMENTS_CATEGORY_PATH, API_MEASUREMENTS_ENTRY_PATH } from "./api/measurements";

// Query hooks
export { useMeasurementsCategoryQuery } from "./queries";

// Widgets
export { CategoryForm } from "./widgets/CategoryForm";
export { MeasurementChart } from "./widgets/MeasurementChart";
