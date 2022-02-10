import { SetExerciseState } from "./stateTypes";
import { Muscle } from "components/Exercises/models/muscle";
import { ExerciseState } from "state/exerciseState";
import { Equipment } from "components/Exercises/models/equipment";
import { Category } from "components/Exercises/models/category";
import { ExerciseBase } from "components/Exercises/models/exerciseBase";

export type ExerciseAction =
    {
        type: SetExerciseState,
        payload: Muscle[] | Equipment[] | Category[] | ExerciseBase[]
    }

export const setExerciseBases = (bases: ExerciseBase[]): ExerciseAction => {
    return { type: SetExerciseState.SET_EXERCISE_BASE, payload: bases };
};

export const setMuscles = (muscles: Muscle[]): ExerciseAction => {
    return { type: SetExerciseState.SET_MUSCLES, payload: muscles };
};

export const setCategories = (categories: Category[]): ExerciseAction => {
    return { type: SetExerciseState.SET_CATEGORIES, payload: categories };
};

export const setEquipment = (equipment: Equipment[]): ExerciseAction => {
    return { type: SetExerciseState.SET_EQUIPMENT, payload: equipment };
};


export const exerciseReducer = (state: ExerciseState, action: ExerciseAction): ExerciseState => {

    switch (action.type) {
        case SetExerciseState.SET_MUSCLES:
            return {
                ...state,
                muscles: action.payload as Muscle[]
            };
        case SetExerciseState.SET_CATEGORIES:
            return {
                ...state,
                categories: action.payload as Category[]
            };
        case SetExerciseState.SET_EQUIPMENT:
            return {
                ...state,
                equipment: action.payload as Equipment[]
            };
        case SetExerciseState.SET_EXERCISE_BASE:
            return {
                ...state,
                exerciseBases: action.payload as ExerciseBase[]
            };

        default:
            return state;
    }
};
