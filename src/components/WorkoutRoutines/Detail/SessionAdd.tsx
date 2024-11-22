import Grid from "@mui/material/Grid2";
import { SessionForm } from "components/WorkoutRoutines/widgets/forms/SessionForm";
import React from "react";

export const SessionAdd = () => {

    return <Grid container>
        <Grid size={6} offset={3}>
            <SessionForm dayId={50} routineId={8} />
        </Grid>
    </Grid>;
};