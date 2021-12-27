import React, { createContext, useContext, useReducer } from "react";
import { Action, reducer } from "state/reducer";
import { WeightEntry } from "components/BodyWeight/model";

export type State = {
    weights: WeightEntry[],
};

const initialState: State = {
    weights: [],
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
