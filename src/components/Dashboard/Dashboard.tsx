import Grid from '@mui/material/Grid2';
import { NutritionCard } from "components/Dashboard/NutritionCard";
import { RoutineCard } from "components/Dashboard/RoutineCard";
import { WeightCard } from "components/Dashboard/WeightCard";
import React from 'react';

export const Dashboard = () => {

    return (
        (<Grid container spacing={2}>
            <Grid size={4}>
                <RoutineCard />
            </Grid>
            <Grid size={4}>
                <NutritionCard />
            </Grid>
            <Grid size={4}>
                <WeightCard />
            </Grid>
        </Grid>)
    );
};