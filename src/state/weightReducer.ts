import { WeightState } from 'state';
import { Notification } from "types";
import { SetWeightState } from "./stateTypes";

export type WeightAction = {
    type: SetWeightState,
    payload: Notification
}


export const setNotification = (notification: Notification): WeightAction => {
    return { type: SetWeightState.SET_NOTIFICATION, payload: notification };
};


export const weightReducer = (state: WeightState, action: WeightAction): WeightState => {

    switch (action.type) {

        case SetWeightState.SET_NOTIFICATION:
            return {
                ...state,
                notification: action.payload as Notification
            };

        default:
            return state;
    }
};
