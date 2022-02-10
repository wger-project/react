import React, { createContext, useContext, useReducer } from "react";
import { Muscle } from "components/Exercises/models/muscle";
import { ExerciseAction, exerciseReducer } from "state/exerciseReducer";

export type ExerciseState = {
    muscles: Muscle[],
};

const initialState: ExerciseState = {
    muscles: [],
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
