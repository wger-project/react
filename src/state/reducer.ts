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
    return { type: SetState.UPDATE_WEIGHT, payload: entry };
};

export const removeWeight = (id: number): Action => {
    return { type: SetState.REMOVE_WEIGHT, payload: id };
};

export const setNotification = (notification: Notification): Action => {
    return { type: SetState.SET_NOTIFICATION, payload: notification };
};


export const reducer = (state: State, action: Action): State => {

    switch (action.type) {
        case SetState.SET_WEIGHTS:
            return {
                ...state,
                weights: action.payload as WeightEntry[]
            };

        // Replace the weight entry with the new one and sort by date
        case SetState.UPDATE_WEIGHT:
            const updatedWeights = (state.weights.map(w => {
                if (w.id === (action.payload as WeightEntry).id) {
                    return action.payload;
                }
                return w;
            }) as WeightEntry[]).sort((a, b) => b.date.getTime() - a.date.getTime());

            return {
                ...state,
                weights: updatedWeights
            };

        // Add a new weight entry and sort by date
        case SetState.ADD_WEIGHT:
            const addWeights = [...state.weights, action.payload as WeightEntry]
                .sort((a, b) => b.date.getTime() - a.date.getTime());
            return {
                ...state,
                weights: addWeights
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
