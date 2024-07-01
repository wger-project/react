import { NotificationState } from 'state';
import { Notification } from "types";
import { SetNotificationState } from "./stateTypes";

export type WeightAction = {
    type: SetNotificationState,
    payload: Notification
}


export const setNotification = (notification: Notification): WeightAction => {
    return { type: SetNotificationState.SET_NOTIFICATION, payload: notification };
};


export const notificationReducer = (state: NotificationState, action: WeightAction): NotificationState => {

    switch (action.type) {

        case SetNotificationState.SET_NOTIFICATION:
            return {
                ...state,
                notification: action.payload as Notification
            };

        default:
            return state;
    }
};
