import { exerciseInitialState, SetExerciseState } from 'state';
import { ExerciseAction, ExerciseState } from "state/exerciseState";
import { ImageFormData } from "components/Exercises/models/exerciseBase";


export const reset = (): ExerciseAction => {
    return { type: SetExerciseState.RESET, payload: null };
};
export const setNameEn = (name: string): ExerciseAction => {
    return { type: SetExerciseState.SET_NAME_EN, payload: name };
};
export const setNameI18n = (name: string): ExerciseAction => {
    return { type: SetExerciseState.SET_NAME_I18N, payload: name };
};
export const setDescriptionEn = (description: string): ExerciseAction => {
    return { type: SetExerciseState.SET_DESCRIPTION_EN, payload: description };
};
export const setDescriptionI18n = (description: string): ExerciseAction => {
    return { type: SetExerciseState.SET_DESCRIPTION_I18N, payload: description };
};
export const setAlternativeNamesEn = (names: string[]): ExerciseAction => {
    return { type: SetExerciseState.SET_ALIASES_EN, payload: names };
};
export const setAlternativeNamesI18n = (names: string[]): ExerciseAction => {
    return { type: SetExerciseState.SET_ALIASES_I18N, payload: names };
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
export const setLanguageId = (id: number | null): ExerciseAction => {
    return { type: SetExerciseState.SET_LANGUAGE, payload: id };
};
export const setImages = (images: ImageFormData[]): ExerciseAction => {
    return { type: SetExerciseState.SET_IMAGES, payload: images };
};


export const exerciseReducer = (state: ExerciseState, action: ExerciseAction): ExerciseState => {

    console.log("exerciseReducer", state, action);
    console.log('__________________________________________________');

    switch (action.type) {
        case SetExerciseState.RESET:
            return exerciseInitialState;

        case SetExerciseState.SET_NAME_EN:
            return {
                ...state,
                nameEn: action.payload as string
            };

        case SetExerciseState.SET_DESCRIPTION_EN:
            return {
                ...state,
                descriptionEn: action.payload as string
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

        case SetExerciseState.SET_LANGUAGE:
            return {
                ...state,
                languageId: action.payload as number
            };

        case SetExerciseState.SET_NAME_I18N:
            return {
                ...state,
                nameI18n: action.payload as string
            };

        case SetExerciseState.SET_DESCRIPTION_I18N:
            return {
                ...state,
                descriptionI18n: action.payload as string
            };

        case SetExerciseState.SET_IMAGES:
            return {
                ...state,
                images: action.payload as ImageFormData[]
            };

        default:
            return state;
    }
};
