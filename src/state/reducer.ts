import {  BodyWeightType } from "types";
import { State } from 'state';
import { setStateType } from "./stateTypes";

export type Action = 
        {
            type: string,
            payload: BodyWeightType[]
        }

export const setWeights = (weights: BodyWeightType[]): Action => {
    return { type: setStateType.SET_WEIGHTS, payload: weights };
};

export const reducer = (state: State, action: Action): State => {
    switch (action.type) {

        case "SET_WEIGHTS":
            return {
                ...state,
                weights: action.payload
            };

        default:
            return state;
    }
};
