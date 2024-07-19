import { TextField } from "@mui/material";
import { Slot } from "components/WorkoutRoutines/models/Slot";
import React from "react";

export const SlotForm = (props: { slot: Slot, routineId: number }) => {

    return <>
        <TextField
            label="Comment"
            variant="standard"
        />
    </>;
};