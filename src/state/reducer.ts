import { State } from 'state';
import { SetState } from "./stateTypes";
import { WeightEntry } from "components/BodyWeight/model";

export type Action =
    {
        type: string,
        payload: WeightEntry[]
    }

export const setWeights = (weights: WeightEntry[]): Action => {
    return { type: SetState.SET_WEIGHTS, payload: weights };
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
