export {
    weightReducer,
    setWeights,
    updateWeightEntry,
    addWeightEntry,
    removeWeight,
    setNotification
} from 'state/weightReducer';
export { WeightStateProvider, useWeightStateValue } from 'state/weightState';
export type { WeightState } from 'state/weightState';
export { SetWeightState, SetExerciseState } from 'state/stateTypes';


export type { ExerciseState } from 'state/exerciseState';
export {
    exerciseReducer,
    setNameEn,
    setAlternativeNamesEn,
    setCategory,
    setEquipment,
    setPrimaryMuscles,
    setSecondaryMuscles,
    setVariationId,
    setNewBaseVariationId,
    reset
} from 'state/exerciseReducer';
export type { ExerciseAction } from 'state/exerciseReducer';
export { ExerciseStateProvider, useExerciseStateValue, exerciseInitialState } from 'state/exerciseState';


