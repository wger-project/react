import { ImageFormData } from "components/Exercises/models/exercise";
import { exerciseSubmissionInitialState, SetExerciseSubmissionState } from 'state';
import { ExerciseSubmissionAction, ExerciseSubmissionState } from "state/exerciseSubmissionState";


export const reset = (): ExerciseSubmissionAction => {
    return { type: SetExerciseSubmissionState.RESET };
};

export const setNameEn = (name: string): ExerciseSubmissionAction => {
    return { type: SetExerciseSubmissionState.SET_NAME_EN, payload: name };
};
export const setDescriptionEn = (description: string): ExerciseSubmissionAction => {
    return { type: SetExerciseSubmissionState.SET_DESCRIPTION_EN, payload: description };
};
export const setNotesEn = (notes: string[]): ExerciseSubmissionAction => {
    return { type: SetExerciseSubmissionState.SET_NOTES_EN, payload: notes };
};
export const setAlternativeNamesEn = (names: string[]): ExerciseSubmissionAction => {
    return { type: SetExerciseSubmissionState.SET_ALIASES_EN, payload: names };
};

export const setNameI18n = (name: string): ExerciseSubmissionAction => {
    return { type: SetExerciseSubmissionState.SET_NAME_I18N, payload: name };
};
export const setDescriptionI18n = (description: string): ExerciseSubmissionAction => {
    return { type: SetExerciseSubmissionState.SET_DESCRIPTION_I18N, payload: description };
};
export const setNotesI18n = (notes: string[]): ExerciseSubmissionAction => {
    return { type: SetExerciseSubmissionState.SET_NOTES_I18N, payload: notes };
};
export const setAlternativeNamesI18n = (names: string[]): ExerciseSubmissionAction => {
    return { type: SetExerciseSubmissionState.SET_ALIASES_I18N, payload: names };
};
export const setCategory = (id: number | null): ExerciseSubmissionAction => {
    return { type: SetExerciseSubmissionState.SET_CATEGORY, payload: id };
};
export const setEquipment = (ids: number[]): ExerciseSubmissionAction => {
    return { type: SetExerciseSubmissionState.SET_EQUIPMENT, payload: ids };
};
export const setPrimaryMuscles = (ids: number[]): ExerciseSubmissionAction => {
    return { type: SetExerciseSubmissionState.SET_PRIMARY_MUSCLES, payload: ids };
};
export const setSecondaryMuscles = (ids: number[]): ExerciseSubmissionAction => {
    return { type: SetExerciseSubmissionState.SET_MUSCLES_SECONDARY, payload: ids };
};
export const setVariationId = (id: number | null): ExerciseSubmissionAction => {
    return { type: SetExerciseSubmissionState.SET_VARIATION_ID, payload: id };
};
export const setNewBaseVariationId = (id: number | null): ExerciseSubmissionAction => {
    return { type: SetExerciseSubmissionState.SET_NEW_VARIATION_BASE_ID, payload: id };
};
export const setLanguageId = (id: number | null): ExerciseSubmissionAction => {
    return { type: SetExerciseSubmissionState.SET_LANGUAGE, payload: id };
};
export const setImages = (images: ImageFormData[]): ExerciseSubmissionAction => {
    return { type: SetExerciseSubmissionState.SET_IMAGES, payload: images };
};


export const exerciseSubmissionReducer = (state: ExerciseSubmissionState, action: ExerciseSubmissionAction): ExerciseSubmissionState => {

    if (action === undefined) {
        return state;
    }

    switch (action.type) {
        case SetExerciseSubmissionState.RESET:
            return exerciseSubmissionInitialState;

        case SetExerciseSubmissionState.SET_NAME_EN:
            return {
                ...state,
                nameEn: action.payload as string
            };

        case SetExerciseSubmissionState.SET_DESCRIPTION_EN:
            return {
                ...state,
                descriptionEn: action.payload as string
            };

        case SetExerciseSubmissionState.SET_NOTES_EN:
            return {
                ...state,
                notesEn: action.payload as string[]
            };

        case SetExerciseSubmissionState.SET_ALIASES_EN:
            return {
                ...state,
                alternativeNamesEn: action.payload as string[]
            };

        case SetExerciseSubmissionState.SET_CATEGORY:
            return {
                ...state,
                category: action.payload as number
            };

        case SetExerciseSubmissionState.SET_EQUIPMENT:
            return {
                ...state,
                equipment: action.payload as number[]
            };

        case SetExerciseSubmissionState.SET_PRIMARY_MUSCLES:
            return {
                ...state,
                muscles: action.payload as number[]
            };

        case SetExerciseSubmissionState.SET_MUSCLES_SECONDARY:
            return {
                ...state,
                musclesSecondary: action.payload as number[]
            };

        case SetExerciseSubmissionState.SET_VARIATION_ID:
            return {
                ...state,
                variationId: action.payload as number
            };

        case SetExerciseSubmissionState.SET_NEW_VARIATION_BASE_ID:
            return {
                ...state,
                newVariationBaseId: action.payload as number
            };

        case SetExerciseSubmissionState.SET_LANGUAGE:
            return {
                ...state,
                languageId: action.payload as number
            };

        case SetExerciseSubmissionState.SET_NAME_I18N:
            return {
                ...state,
                nameI18n: action.payload as string
            };

        case SetExerciseSubmissionState.SET_DESCRIPTION_I18N:
            return {
                ...state,
                descriptionI18n: action.payload as string
            };

        case SetExerciseSubmissionState.SET_NOTES_I18N:
            return {
                ...state,
                notesI18n: action.payload as string[]
            };

        case SetExerciseSubmissionState.SET_ALIASES_I18N:
            return {
                ...state,
                alternativeNamesI18n: action.payload as string[]
            };

        case SetExerciseSubmissionState.SET_IMAGES:
            return {
                ...state,
                images: action.payload as ImageFormData[]
            };

        default:
            return state;
    }
};
