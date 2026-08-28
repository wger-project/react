import { ImageFormData } from "@/components/Exercises/models/exercise";

export enum SetExerciseSubmissionState {
    RESET,

    SET_NAME_EN,
    SET_ALIASES_EN,
    SET_DESCRIPTION_EN,
    SET_NOTES_EN,
    SET_CATEGORY,
    SET_EQUIPMENT,
    SET_PRIMARY_MUSCLES,
    SET_MUSCLES_SECONDARY,
    SET_VARIATION_ID,
    SET_NEW_VARIATION_BASE_ID,
    SET_LANGUAGE,
    SET_NAME_I18N,
    SET_ALIASES_I18N,
    SET_DESCRIPTION_I18N,
    SET_NOTES_I18N,
    SET_IMAGES
}

export type ExerciseSubmissionAction = {
    type: SetExerciseSubmissionState,
    payload?: number | number[] | string | string[] | null | ImageFormData[],
}

export type ExerciseSubmissionState = {
    nameEn: string;
    descriptionEn: string;
    alternativeNamesEn: string[];
    notesEn: string[];

    languageId: number | null;
    nameI18n: string;
    alternativeNamesI18n: string[];
    descriptionI18n: string;
    notesI18n: string[];

    category: number | null;
    muscles: number[];
    musclesSecondary: number[];
    equipment: number[];
    variationGroup: string | null;
    newVariationExerciseId: number | null;

    images: ImageFormData[];
}

export const exerciseSubmissionInitialState: ExerciseSubmissionState = {
    category: null,
    muscles: [],
    musclesSecondary: [],
    variationGroup: null,
    newVariationExerciseId: null,
    languageId: null,
    equipment: [],

    nameEn: "",
    descriptionEn: "",
    alternativeNamesEn: [],
    notesEn: [],

    nameI18n: "",
    alternativeNamesI18n: [],
    descriptionI18n: "",
    notesI18n: [],

    images: [],
};
