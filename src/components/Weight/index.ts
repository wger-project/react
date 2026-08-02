/**
 * Public surface of the Weight domain.
 *
 * Other code may only import from `@/components/Weight`, never from
 * internal sub-paths.
 */
export { BodyWeight } from "./screens/BodyWeight";
export { WeightForm } from "./forms/WeightForm";
export { WeightTableDashboard } from "./widgets/TableDashboard/TableDashboard";
export { WeightChart } from "./widgets/WeightChart";
export { extraDataInUnit, weightUnitOf } from "./models/bodyWeight";
export { useBodyWeightCategoryQuery, useBodyWeightQuery, useDisplayWeightUnit } from "./queries";
