import { State } from 'state';
import { SetState } from "./stateTypes";
import { WeightEntry } from "components/BodyWeight/model";
import { Notification } from "types";

export type Action =
    {
        type: string,
        payload: WeightEntry[] | WeightEntry | number | Notification
    }

export const setWeights = (weights: WeightEntry[]): Action => {
    return { type: SetState.SET_WEIGHTS, payload: weights };
};

export const updateWeightEntry = (entry: WeightEntry): Action => {
    return { type: SetState.UPDATE_WEIGHT, payload: entry };
};

export const addWeightEntry = (entry: WeightEntry): Action => {    
    return { type: SetState.ADD_WEIGHT, payload: entry };
};

export const removeWeight = (id: number): Action => {
    return { type: SetState.REMOVE_WEIGHT, payload: id };
};

export const setNotification = (notification: Notification): Action => {
    return { type: SetState.SET_NOTIFICATION, payload: notification };
};

// const isWeightEntryArray = (weights: unknown): weights is WeightEntry[] =>{
//     return Array.isArray(weights);
// };

export const reducer = (state: State, action: Action): State => {

    switch (action.type) {
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

        // remove a weight from state
        case SetState.REMOVE_WEIGHT:
            const updatedWeightsAfterRemove = state.weights.filter(w => w.id !== action.payload);

            return {
                ...state,
                weights: updatedWeightsAfterRemove
            };
        
        case SetState.SET_NOTIFICATION:

            return {
                ...state,
                notification: action.payload as Notification
            };

        default:
            return state;
    }
};
