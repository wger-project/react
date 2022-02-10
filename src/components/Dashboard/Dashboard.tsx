import { Grid } from '@mui/material';
import React from 'react';
import { WeightCard } from "components/Dashboard/WeightCard";
import { WorkoutCard } from "components/Dashboard/WorkoutCard";
import { NutritionCard } from "components/Dashboard/NutritionCard";

export const Dashboard = () => {

    return (
        <Grid container spacing={2}>
            <Grid item xs={4}>
                <WorkoutCard />
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