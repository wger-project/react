import { TextField } from "@mui/material";
import { SlotConfig } from "components/WorkoutRoutines/models/SlotConfig";
import React from "react";

export const SlotConfigForm = (props: { slotConfig: SlotConfig, routineId: number }) => {

    return <>
        <TextField
            label="Comment"
            variant="standard"
        />
    </>;
};