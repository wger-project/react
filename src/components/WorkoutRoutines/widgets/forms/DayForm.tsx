import { FormControlLabel, Switch, TextField } from "@mui/material";
import { Day } from "components/WorkoutRoutines/models/Day";
import { useEditDayQuery } from "components/WorkoutRoutines/queries";
import React from "react";

export const DayForm = (props: { day: Day, routineId: number }) => {
    const editDayQuery = useEditDayQuery(1);

    return <>
        <TextField
            label="Name"
            variant="standard"
            value={props.day.name}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                const data = {
                    id: props.day.id,
                    routine: props.routineId,
                    name: event.target.value
                };
                editDayQuery.mutate(data);
            }}
        />

        <TextField
            label="Description"
            variant="standard"
            value={props.day.description}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                const data = {
                    id: props.day.id,
                    routine: props.routineId,
                    description: event.target.value
                };
                editDayQuery.mutate(data);
            }}
            multiline
            maxRows={4}
        />
        <FormControlLabel control={<Switch defaultChecked />} label="rest day" />
    </>;
};