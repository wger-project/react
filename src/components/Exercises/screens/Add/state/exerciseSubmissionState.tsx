import React, { createContext, useContext, useReducer } from "react";
import { exerciseSubmissionReducer } from "@/components/Exercises/screens/Add/state/exerciseSubmissionReducer";
import {
    ExerciseSubmissionAction,
    exerciseSubmissionInitialState,
    ExerciseSubmissionState
} from "@/components/Exercises/screens/Add/state/stateTypes";

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