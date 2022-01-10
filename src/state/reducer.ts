import { State } from 'state';
import { SetState } from "./stateTypes";
import { WeightEntry } from "components/BodyWeight/model";

export type Action = {
    type: string,
    payload: WeightEntry[] | WeightEntry
}

export const setWeights = (weights: WeightEntry[]): Action => {
    return { type: SetState.SET_WEIGHTS, payload: weights };
};

export const updateWeightEntry = (entry: WeightEntry): Action => {
    return { type: SetState.UPDATE_WEIGHT, payload: entry };
};

export const addWeightEntry = (entry: WeightEntry): Action => {
    return { type: SetState.UPDATE_WEIGHT, payload: entry };
};

export const reducer = (state: State, action: Action): State => {

    switch (action.type) {
        // Load all weights from the server
        case SetState.SET_WEIGHTS:
            return {
                ...state,
                weights: action.payload as WeightEntry[]
            };

        // Replace the weight entry with the new one
        case SetState.UPDATE_WEIGHT:
            const newWeights = state.weights.map(w => {
                if (w.id === (action.payload as WeightEntry).id) {
                    return action.payload;
                }
                return w;
            });

            return {
                ...state,
                weights: newWeights as WeightEntry[]
            };

        // Add a new weight entry
        case SetState.ADD_WEIGHT:
            return {
                ...state,
                weights: [...state.weights, action.payload as WeightEntry]
            };

        default:
            return state;
    }
};
