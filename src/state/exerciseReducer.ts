import { SetExerciseState } from "./stateTypes";
import { Muscle } from "components/Exercises/models/muscle";
import { ExerciseState } from "state/exerciseState";
import { Equipment } from "components/Exercises/models/equipment";
import { Category } from "components/Exercises/models/category";

export type ExerciseAction =
    {
        type: string,
        payload: Muscle[] | Equipment[] | Category[]
    }

export const setMuscles = (muscles: Muscle[]): ExerciseAction => {
    return { type: SetExerciseState.SET_MUSCLES, payload: muscles };
};


export const exerciseReducer = (state: ExerciseState, action: ExerciseAction): ExerciseState => {

    switch (action.type) {
        case SetExerciseState.SET_MUSCLES:
            return {
                ...state,
                muscles: action.payload as Muscle[]
            };

        default:
            return state;
    }
};
