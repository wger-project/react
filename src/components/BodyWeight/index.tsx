import React, { useCallback, useEffect } from 'react';
import { getWeights } from 'services';
import styles from './body_weight.module.css';
import { setWeights, useWeightStateValue } from 'state';
import { WeightChart } from "components/BodyWeight/WeightChart";
import { Box } from "@mui/material";
import { WeightTable } from "components/BodyWeight/Table";

export const BodyWeight = () => {
    const [state, dispatch] = useWeightStateValue();

    // Using useCallback so that I can use this fetchWeight method in
    // useEffect and elsewhere.
    const fetchWeights = useCallback(async () => {
        try {
            const receivedWeights = await getWeights();
            dispatch(setWeights(receivedWeights));
        } catch (error) {
            console.log(error);
        }
    }, [dispatch]);

    useEffect(() => {
        fetchWeights();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchWeights]);

    return (
        <div className={styles.root}>
            <WeightChart weights={state.weights} />
            <Box sx={{ mt: 4 }} />
            <WeightTable weights={state.weights} />
        </div>
    );
};