import Grid from "@mui/material/Grid2";
import { RoutineForm } from "components/WorkoutRoutines/widgets/forms/RoutineForm";
import React from "react";

export const RoutineAdd = () => {

    return <Grid container>
        <Grid size={6} offset={3}>
            <RoutineForm />
        </Grid>
    </Grid>;
};