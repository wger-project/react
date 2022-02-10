import { WeightState } from 'state';
import { SetWeightState } from "./stateTypes";
import { WeightEntry } from "components/BodyWeight/model";
import { Notification } from "types";

export type WeightAction =
    {
        type: string,
        payload: WeightEntry[] | WeightEntry | Notification
    }

export const setWeights = (weights: WeightEntry[]): WeightAction => {
    return { type: SetWeightState.SET_WEIGHTS, payload: weights };
};

export const updateWeightEntry = (entry: WeightEntry): WeightAction => {
    return { type: SetWeightState.UPDATE_WEIGHT, payload: entry };
};

export const addWeightEntry = (entry: WeightEntry): WeightAction => {
    return { type: SetWeightState.ADD_WEIGHT, payload: entry };
};

export const removeWeight = (entry: WeightEntry): WeightAction => {
    return { type: SetWeightState.REMOVE_WEIGHT, payload: entry };
};

export const setNotification = (notification: Notification): WeightAction => {
    return { type: SetWeightState.SET_NOTIFICATION, payload: notification };
};


export const weightReducer = (state: WeightState, action: WeightAction): WeightState => {

    switch (action.type) {
        case SetWeightState.SET_WEIGHTS:
            return {
                ...state,
                weights: action.payload as WeightEntry[]
            };

        // Replace the weight entry with the new one and sort by date
        case SetWeightState.UPDATE_WEIGHT:
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
        case SetWeightState.ADD_WEIGHT:
            const addWeights = [...state.weights, action.payload as WeightEntry]
                .sort((a, b) => b.date.getTime() - a.date.getTime());
            return {
                ...state,
                weights: addWeights
            };

        // remove a weight from state
        case SetWeightState.REMOVE_WEIGHT:
            const updatedWeightsAfterRemove = state.weights.filter(w => w.id !== (action.payload as WeightEntry).id);

            return {
                ...state,
                weights: updatedWeightsAfterRemove
            };

        case SetWeightState.SET_NOTIFICATION:

            return {
                ...state,
                notification: action.payload as Notification
            };

        default:
            return state;
    }
};
