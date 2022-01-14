import React, { useCallback, useEffect } from 'react';
import { getWeights } from 'services';
import { WeightTable } from './Table';
import styles from './body_weight.module.css';
import { setWeights, useStateValue } from 'state';
import { WeightChart } from "components/BodyWeight/WeightChart";

export const BodyWeight = () => {
    const [state, dispatch] = useStateValue();

    // Using useCallback so that I can use this fetchWeight method in
    // useEffect and elsewhere.
    const fetchWeights = useCallback(async () => {
        try {
            const receivedWeights = await getWeights();
            dispatch(setWeights(receivedWeights));
        } catch (error) {
            console.log(error);
        }
    }, []);

    useEffect(() => {
        fetchWeights();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchWeights]);

    return (
        <div className={styles.root}>
            <WeightChart weights={state.weights}/>
            <WeightTable weights={state.weights}/>
        </div>
    );
};