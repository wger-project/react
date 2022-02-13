import React, { createContext, useContext, useReducer } from "react";
import { Muscle } from "components/Exercises/models/muscle";
import { ExerciseAction, exerciseReducer } from "state/exerciseReducer";
import { Category } from "components/Exercises/models/category";
import { Equipment } from "components/Exercises/models/equipment";
import { ExerciseBase } from "components/Exercises/models/exerciseBase";
import { Language } from "components/Exercises/models/language";

export type ExerciseState = {
    muscles: Muscle[],
    categories: Category[],
    equipment: Equipment[],
    exerciseBases: ExerciseBase[]
    languages: Language[]
};

const initialState: ExerciseState = {
    muscles: [],
    categories: [],
    equipment: [],
    exerciseBases: [],
    languages: []
};

export const ExerciseStateContext = createContext<[ExerciseState, React.Dispatch<ExerciseAction>]>([
    initialState,
    () => initialState
]);

type StateProp = {
    children: React.ReactElement
};

export const ExerciseStateProvider: React.FC<StateProp> = ({ children }: StateProp) => {
    const [state, dispatch] = useReducer(exerciseReducer, initialState);

    return (
        <ExerciseStateContext.Provider value={[state, dispatch]}>
            {children}
        </ExerciseStateContext.Provider>
    );
};

export const useExerciseStateValue = () => useContext(ExerciseStateContext);
