import React, { createContext, useReducer, useContext } from "react";
import { BodyWeightType } from "types";
import { Action, reducer } from "state/reducer";

export type State = {
    weights: BodyWeightType[],
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

export const StateProvider: React.FC<StateProp> = ({children}: StateProp) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    return (
            <StateContext.Provider value={[state, dispatch]}>
                {children}
            </StateContext.Provider>
        );
};

export const useStateValue = () =>useContext(StateContext);
