/**
 * Public surface of the Routines domain (Django app: manager).
 *
 * Other code may only import from `@/components/Routines`, never from
 * internal sub-paths.
 */
export { RoutineAdd } from "./Detail/RoutineAdd";
export { RoutineDetail } from "./Detail/RoutineDetail";
export { RoutineDetailsTable } from "./Detail/RoutineDetailsTable";
export { RoutineEdit } from "./Detail/RoutineEdit";
export { SessionAdd } from "./Detail/SessionAdd";
export { SlotProgressionEdit } from "./Detail/SlotProgressionEdit";
export { TemplateDetail } from "./Detail/TemplateDetail";
export { WorkoutLogs } from "./Detail/WorkoutLogs";
export { WorkoutStats } from "./Detail/WorkoutStats";

export { PrivateTemplateOverview } from "./Overview/PrivateTemplateOverview";
export { PublicTemplateOverview } from "./Overview/PublicTemplateOverview";
export { RoutineOverview } from "./Overview/RoutineOverview";

// Models
export {
    BaseConfig,
    BaseConfigAdapter,
    type OperationType,
    type RuleRequirements,
    type StepType,
} from "./models/BaseConfig";
export { Day, getDayName } from "./models/Day";
export { RoutineStatsData, RoutineStatsDataAdapter } from "./models/LogStats";
export { RepetitionUnit, RepetitionUnitAdapter } from "./models/RepetitionUnit";
export { Routine } from "./models/Routine";
export { RoutineDayData } from "./models/RoutineDayData";
export { RoutineLogData, RoutineLogDataAdapter } from "./models/RoutineLogData";
export { SetConfigData } from "./models/SetConfigData";
export { Slot } from "./models/Slot";
export { SlotData } from "./models/SlotData";
export { SlotEntry } from "./models/SlotEntry";
export { WeightUnit, WeightUnitAdapter } from "./models/WeightUnit";
export { WorkoutLog, WorkoutLogAdapter } from "./models/WorkoutLog";
export {
    type AddSessionParams,
    type EditSessionParams,
    WorkoutSession,
    WorkoutSessionAdapter,
} from "./models/WorkoutSession";

// Query hooks
export { useActiveRoutineQuery, useSessionsQuery } from "./queries";

// Widgets
export { SetConfigDataDetails } from "./widgets/RoutineDetailsCard";
