import React, { createContext, useContext, useReducer } from "react";
import { WeightAction, weightReducer } from "state/weightReducer";
import { WeightEntry } from "components/BodyWeight/model";
import { Notification } from "types";

export type WeightState = {
    weights: WeightEntry[],
    notification: Notification
};

const initialState: WeightState = {
    weights: [],
    notification: { notify: false, message: "", severity: undefined, title: "", type: undefined }
};

export const WeightStateContext = createContext<[WeightState, React.Dispatch<WeightAction>]>([
    initialState,
    () => initialState
]);

type StateProp = {
    children: React.ReactElement
};

export const WeightStateProvider: React.FC<StateProp> = ({ children }: StateProp) => {
    const [state, dispatch] = useReducer(weightReducer, initialState);

    return (
        <WeightStateContext.Provider value={[state, dispatch]}>
            {children}
        </WeightStateContext.Provider>
    );
};

export const useWeightStateValue = () => useContext(WeightStateContext);
