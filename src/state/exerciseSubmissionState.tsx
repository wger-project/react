import { ImageFormData } from "components/Exercises/models/exercise";
import React, { createContext, useContext, useReducer } from "react";
import { exerciseSubmissionReducer } from "state/exerciseSubmissionReducer";
import { SetExerciseSubmissionState } from "state/stateTypes";

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
    variationId: number | null;
    newVariationBaseId: number | null;

    images: ImageFormData[];
}

export const exerciseSubmissionInitialState: ExerciseSubmissionState = {
    category: null,
    muscles: [],
    musclesSecondary: [],
    variationId: null,
    newVariationBaseId: null,
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


export const ExerciseSubmissionStateContext = createContext<[ExerciseSubmissionState, React.Dispatch<ExerciseSubmissionAction>]>([
    exerciseSubmissionInitialState,
    () => exerciseSubmissionInitialState
]);

type StateProp = {
    children: React.ReactElement
};

export const ExerciseSubmissionStateProvider: React.FC<StateProp> = ({ children }: StateProp) => {
    const [state, dispatch] = useReducer(exerciseSubmissionReducer, exerciseSubmissionInitialState);

    return (
        <ExerciseSubmissionStateContext.Provider value={[state, dispatch]}>
            {children}
        </ExerciseSubmissionStateContext.Provider>
    );
};

export const useExerciseSubmissionStateValue = () => useContext(ExerciseSubmissionStateContext);