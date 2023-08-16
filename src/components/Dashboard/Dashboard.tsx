import { Grid } from '@mui/material';
import { LoadingPlaceholder } from "components/Core/LoadingWidget/LoadingWidget";
import { NutritionCard } from "components/Dashboard/NutritionCard";
import { WeightCard } from "components/Dashboard/WeightCard";
import { WorkoutCard } from "components/Dashboard/WorkoutCard";
import { useFetchLastNutritionalPlanIdQuery } from "components/Nutrition/queries";
import React from 'react';

export const Dashboard = () => {

    const planQuery = useFetchLastNutritionalPlanIdQuery();

    return (
        <Grid container spacing={2}>
            <Grid item xs={4}>
                <WorkoutCard />
            </Grid>
            <Grid item xs={4}>
                {planQuery.isLoading
                    ? <LoadingPlaceholder />
                    : <NutritionCard planId={planQuery.data!} />
                }
            </Grid>
            <Grid item xs={4}>
                <WeightCard />
            </Grid>
        </Grid>
    );
};