import { ImageFormData } from "components/Exercises/models/exerciseBase";
import React, { createContext, useContext, useReducer } from "react";
import { exerciseReducer } from "state/exerciseReducer";
import { SetExerciseState } from "state/stateTypes";

export type ExerciseAction = {
    type: SetExerciseState,
    payload?: number | number[] | string | string[] | null | ImageFormData[],
}

export type ExerciseState = {
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

export const exerciseInitialState: ExerciseState = {
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


export const ExerciseStateContext = createContext<[ExerciseState, React.Dispatch<ExerciseAction>]>([
    exerciseInitialState,
    () => exerciseInitialState
]);

type StateProp = {
    children: React.ReactElement
};

export const ExerciseStateProvider: React.FC<StateProp> = ({ children }: StateProp) => {
    const [state, dispatch] = useReducer(exerciseReducer, exerciseInitialState);

    return (
        <ExerciseStateContext.Provider value={[state, dispatch]}>
            {children}
        </ExerciseStateContext.Provider>
    );
};

export const useExerciseStateValue = () => useContext(ExerciseStateContext);