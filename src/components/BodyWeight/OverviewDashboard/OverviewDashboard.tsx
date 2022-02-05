import React, { useCallback, useEffect } from 'react';
import { getWeights } from 'services';
import { setWeights, useStateValue } from 'state';
import { WeightChart } from "components/BodyWeight/WeightChart";
import { Box } from "@mui/material";
import { WeightTableDashboard } from "components/BodyWeight/TableDashboard/TableDashboard";

export const OverviewDashboard = () => {
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
    }, [dispatch]);

    useEffect(() => {
        fetchWeights();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchWeights]);

    return (
        <div>
            <WeightChart weights={state.weights} height={200} />
            <Box sx={{ mt: 2, }}>
                <WeightTableDashboard weights={state.weights} />
            </Box>
        </div>
    );
};