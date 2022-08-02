import { ImageFormData } from "components/Exercises/models/exerciseBase";
import React, { createContext, useContext, useReducer } from "react";
import { ExerciseAction, exerciseReducer } from "state/exerciseReducer";


export type ExerciseState = {
    nameEn: string;
    descriptionEn: string;
    alternativeNamesEn: string[];

    languageId: number | null;
    nameTranslation: string;
    alternativeNamesTranslation: string[];
    descriptionTranslation: string;

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

    nameTranslation: "",
    alternativeNamesTranslation: [],
    descriptionTranslation: "",
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