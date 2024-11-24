export {
    useRoutinesQuery, useRoutineDetailQuery, useActiveRoutineQuery, useRoutinesShallowQuery, useDeleteRoutineQuery,
} from './routines';

export {
    useAddWeightConfigQuery,
    useAddMaxWeightConfigQuery,
    useAddRepsConfigQuery,
    useAddMaxRepsConfigQuery,
    useAddNrOfSetsConfigQuery,
    useAddRiRConfigQuery,
    useAddRestConfigQuery,
    useAddMaxRestConfigQuery,
    useEditWeightConfigQuery,
    useEditMaxRepsConfigQuery,
    useEditMaxRestConfigQuery,
    useEditMaxWeightConfigQuery,
    useEditNrOfSetsConfigQuery,
    useEditRepsConfigQuery,
    useEditRestConfigQuery,
    useEditRiRConfigQuery,
    useDeleteWeightConfigQuery,
    useDeleteMaxWeightConfigQuery,
    useDeleteRepsConfigQuery,
    useDeleteMaxRepsConfigQuery,
    useDeleteNrOfSetsConfigQuery,
    useDeleteRiRConfigQuery,
    useDeleteRestConfigQuery,
    useDeleteMaxRestConfigQuery,
} from './configs';

export { useEditDayQuery, useAddDayQuery, useEditDayOrderQuery, useDeleteDayQuery, } from './days';

export { useRoutineLogQuery, useAddRoutineLogsQuery } from "./logs";

export {
    useDeleteSlotEntryQuery,
    useEditSlotEntryQuery,
    useAddSlotEntryQuery,
} from "./slot_entries";
export {
    useFetchRoutineWeighUnitsQuery,
    useFetchRoutineRepUnitsQuery
} from "./units";
export {
    useAddSlotQuery,
    useEditSlotQuery,
    useDeleteSlotQuery,
    useEditSlotOrderQuery,
} from "./slots";

export { useAddSessionQuery, useEditSessionQuery, useFindSessionQuery } from "./sessions";