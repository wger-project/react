import React, { createContext, useContext, useReducer } from "react";
import { notificationReducer, WeightAction } from "state/notificationReducer";
import { Notification } from "types";

export type NotificationState = {
    notification: Notification
};

const initialState: NotificationState = {
    notification: { notify: false, message: "", severity: undefined, title: "", type: undefined }
};

export const WeightStateContext = createContext<[NotificationState, React.Dispatch<WeightAction>]>([
    initialState,
    () => initialState
]);

type StateProp = {
    children: React.ReactElement
};

export const NotificationStateProvider: React.FC<StateProp> = ({ children }: StateProp) => {
    const [state, dispatch] = useReducer(notificationReducer, initialState);

    return (
        <WeightStateContext.Provider value={[state, dispatch]}>
            {children}
        </WeightStateContext.Provider>
    );
};

export const useWeightStateValue = () => useContext(WeightStateContext);
