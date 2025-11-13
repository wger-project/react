import Grid from "@mui/material/Grid";
import { NutritionCard } from "components/Dashboard/NutritionCard";
import { RoutineCard } from "components/Dashboard/RoutineCard";
import { WeightCard } from "components/Dashboard/WeightCard";
import React from "react";

export const Dashboard = () => {
    return (
        <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
                <RoutineCard />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
                <NutritionCard />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
                <WeightCard />
            </Grid>
        </Grid>
    );
};
