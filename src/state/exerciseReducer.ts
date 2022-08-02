import { exerciseInitialState, SetExerciseState } from 'state';
import { ExerciseState } from "state/exerciseState";

export type ExerciseAction = {
    type: SetExerciseState,
    payload: number | number[] | string | string[] | null
}

export const reset = (): ExerciseAction => {
    return { type: SetExerciseState.RESET, payload: null };
};
export const setNameEn = (name: string): ExerciseAction => {
    return { type: SetExerciseState.SET_NAME_EN, payload: name };
};
export const setAlternativeNamesEn = (names: string[]): ExerciseAction => {
    return { type: SetExerciseState.SET_ALIASES_EN, payload: names };
};
export const setCategory = (id: number | null): ExerciseAction => {
    return { type: SetExerciseState.SET_CATEGORY, payload: id };
};
export const setEquipment = (ids: number[]): ExerciseAction => {
    return { type: SetExerciseState.SET_EQUIPMENT, payload: ids };
};
export const setPrimaryMuscles = (ids: number[]): ExerciseAction => {
    return { type: SetExerciseState.SET_PRIMARY_MUSCLES, payload: ids };
};
export const setSecondaryMuscles = (ids: number[]): ExerciseAction => {
    return { type: SetExerciseState.SET_MUSCLES_SECONDARY, payload: ids };
};
export const setVariationId = (id: number | null): ExerciseAction => {
    return { type: SetExerciseState.SET_VARIATION_ID, payload: id };
};
export const setNewBaseVariationId = (id: number | null): ExerciseAction => {
    return { type: SetExerciseState.SET_NEW_VARIATION_BASE_ID, payload: id };
};


export const exerciseReducer = (state: ExerciseState, action: ExerciseAction): ExerciseState => {

    switch (action.type) {
        case SetExerciseState.RESET:
            return exerciseInitialState;

        case SetExerciseState.SET_NAME_EN:
            return {
                ...state,
                nameEn: action.payload as string
            };

        case SetExerciseState.SET_ALIASES_EN:
            return {
                ...state,
                alternativeNamesEn: action.payload as string[]
            };

        case SetExerciseState.SET_CATEGORY:
            return {
                ...state,
                category: action.payload as number
            };

        case SetExerciseState.SET_EQUIPMENT:
            return {
                ...state,
                equipment: action.payload as number[]
            };

        case SetExerciseState.SET_PRIMARY_MUSCLES:
            return {
                ...state,
                muscles: action.payload as number[]
            };

        case SetExerciseState.SET_MUSCLES_SECONDARY:
            return {
                ...state,
                musclesSecondary: action.payload as number[]
            };

        case SetExerciseState.SET_VARIATION_ID:
            return {
                ...state,
                variationId: action.payload as number
            };

        case SetExerciseState.SET_NEW_VARIATION_BASE_ID:
            return {
                ...state,
                newVariationBaseId: action.payload as number
            };

        default:
            return state;
    }
};
