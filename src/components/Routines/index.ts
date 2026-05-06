/**
 * Public surface of the Routines domain (Django app: manager).
 *
 * Other code may only import from `@/components/Routines`, never from
 * internal sub-paths.
 */
export { RoutineAdd } from "./screens/Detail/RoutineAdd";
export { RoutineDetail } from "./screens/Detail/RoutineDetail";
export { RoutineDetailsTable } from "./screens/Detail/RoutineDetailsTable";
export { RoutineEdit } from "./screens/Detail/RoutineEdit";
export { SessionAdd } from "./screens/Detail/SessionAdd";
export { SlotProgressionEdit } from "./screens/Detail/SlotProgressionEdit";
export { TemplateDetail } from "./screens/Detail/TemplateDetail";
export { WorkoutLogs } from "./screens/Detail/WorkoutLogs";
export { WorkoutStats } from "./screens/Detail/WorkoutStats";

export { PrivateTemplateOverview } from "./screens/Overview/PrivateTemplateOverview";
export { PublicTemplateOverview } from "./screens/Overview/PublicTemplateOverview";
export { RoutineOverview } from "./screens/Overview/RoutineOverview";

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
