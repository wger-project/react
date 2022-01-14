import { State } from 'state';
import { SetState } from "./stateTypes";
import { WeightEntry } from "components/BodyWeight/model";

export type Action =
    {
        type: string,
        payload: WeightEntry[] | number
    }

export const setWeights = (weights: WeightEntry[]): Action => {
    return { type: SetState.SET_WEIGHTS, payload: weights };
};

export const removeWeight = (id: number): Action => {
    return { type: SetState.REMOVE_WEIGHT, payload: id };
};

const isWeightEntryArray = (weights: unknown): weights is WeightEntry[] =>{
    return Array.isArray(weights);
};

export const reducer = (state: State, action: Action): State => {

    switch (action.type) {
        case SetState.SET_WEIGHTS:
            return {
                ...state,
                weights: isWeightEntryArray(action.payload) ? action.payload : []
            };
        
        case SetState.REMOVE_WEIGHT:
            const updatedWeightsAfterRemove = state.weights.filter(w => w.id !== action.payload);

            return {
                ...state,
                weights: updatedWeightsAfterRemove
            };

        default:
            return state;
    }
};
