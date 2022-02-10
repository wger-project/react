import React, { createContext, useContext, useReducer } from "react";
import { Action, reducer } from "state/reducer";
import { WeightEntry } from "components/BodyWeight/model";
import { Notification } from "types";

export type State = {
    weights: WeightEntry[],
    notification: Notification
};

const initialState: State = {
    weights: [],
    notification: {notify: false, message: "", severity: undefined, title: "", type: undefined}
};

export const StateContext = createContext<[State, React.Dispatch<Action>]>([
    initialState,
    () => initialState
]);

type StateProp = {
    children: React.ReactElement
};

export const StateProvider: React.FC<StateProp> = ({ children }: StateProp) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    return (
        <StateContext.Provider value={[state, dispatch]}>
            {children}
        </StateContext.Provider>
    );
};

export const useStateValue = () => useContext(StateContext);
