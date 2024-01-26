import { Grid } from '@mui/material';
import { NutritionCard } from "components/Dashboard/NutritionCard";
import { RoutineCard } from "components/Dashboard/RoutineCard";
import { WeightCard } from "components/Dashboard/WeightCard";
import React from 'react';

export const Dashboard = () => {

    return (
        <Grid container spacing={2}>
            <Grid item xs={4}>
                <RoutineCard />
            </Grid>
            <Grid item xs={4}>
                <NutritionCard />
            </Grid>
            <Grid item xs={4}>
                <WeightCard />
            </Grid>
        </Grid>
    );
};