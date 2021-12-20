import {BodyWeightType} from "types";
import {State} from 'state';
import {SetState} from "./stateTypes";

export type Action =
    {
        type: string,
        payload: BodyWeightType[]
    }

export const setWeights = (weights: BodyWeightType[]): Action => {
    return {type: SetState.SET_WEIGHTS, payload: weights};
};

export const reducer = (state: State, action: Action): State => {
    switch (action.type) {

        case SetState.SET_WEIGHTS:
            return {
                ...state,
                weights: action.payload
            };

        default:
            return state;
    }
};
