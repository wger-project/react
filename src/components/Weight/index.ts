/**
 * Public surface of the Weight domain.
 *
 * Other code may only import from `@/components/Weight`, never from
 * internal sub-paths.
 */
export { BodyWeight } from "./BodyWeight";
export { WeightForm } from "./Form/WeightForm";
export { WeightTableDashboard } from "./TableDashboard/TableDashboard";
export { WeightChart } from "./WeightChart";
export { WeightEntry } from "./model";
export { useBodyWeightQuery } from "./queries";
export type { FilterType } from "./widgets/FilterButtons";
