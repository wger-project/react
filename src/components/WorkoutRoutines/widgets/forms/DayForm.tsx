import { LoadingButton } from "@mui/lab";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    Grid,
    Switch,
    TextField
} from "@mui/material";
import { Day } from "components/WorkoutRoutines/models/Day";
import { useEditDayQuery } from "components/WorkoutRoutines/queries";
import React, { useEffect, useState } from "react";
import { DEBOUNCE_ROUTINE_FORMS } from "utils/consts";

export const DayForm = (props: { day: Day, routineId: number }) => {

    const editDayQuery = useEditDayQuery(props.routineId);

    const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
    const [openDialog, setOpenDialog] = useState(false);

    const [name, setName] = useState(props.day.name);
    const [description, setDescription] = useState(props.day.description);
    const [isRest, setIsRest] = useState(props.day.isRest);

    useEffect(() => {
        setName(props.day.name);
        setDescription(props.day.description);
        setIsRest(props.day.isRest);
    }, [props.day]);

    const handleRestChange = () => setOpenDialog(true);

    const handleDialogClose = () => setOpenDialog(false);

    const handleConfirmRestChange = () => {
        // TODO: there seems to be a but that isRest is not correctly updated there, as
        //       a workaround we just pass the new value directly to handleData
        handleData(!isRest);
        setOpenDialog(false);
    };


    const handleData = (isRest: boolean) => {
        const data = {
            id: props.day.id,
            routine: props.routineId,
            name: name,
            description: description,
            is_rest: isRest
        };

        editDayQuery.mutate(data);
    };

    const onChange = (text: string, setValue: (value: string) => void) => {
        setValue(text);

        if (timer) {
            clearTimeout(timer);
        }
        setTimer(setTimeout(() => handleData(isRest), DEBOUNCE_ROUTINE_FORMS));
    };

    return <>
        <Grid container spacing={2}>
            <Grid item xs={10}>
                <TextField
                    fullWidth
                    label="Name"
                    variant="standard"
                    disabled={isRest}
                    value={name}
                    onChange={e => onChange(e.target.value, setName)}
                />
            </Grid>
            <Grid item xs={2}>
                <FormControlLabel
                    control={<Switch checked={isRest} onChange={handleRestChange} />}
                    label="rest day" />
            </Grid>
            <Grid item xs={12}>
                <TextField
                    label="Description"
                    variant="standard"
                    fullWidth
                    value={description}
                    disabled={isRest}
                    onChange={e => onChange(e.target.value, setDescription)}
                    multiline
                    rows={4}
                />
            </Grid>
            <Grid item xs={12}>
                {editDayQuery.isLoading &&
                    <LoadingButton loading variant="text">
                        &nbsp;
                    </LoadingButton>
                }
            </Grid>
        </Grid>

        <Dialog open={openDialog} onClose={handleDialogClose}>
            <DialogTitle>Confirm Rest Day Change</DialogTitle>
            <DialogContent>
                Are you sure you want to change this day to a {isRest ? 'non-rest' : 'rest'} day?
            </DialogContent>
            <DialogContent>
                A rest day has no exercises associated with it. Any entries will be deleted, etc. etc.
            </DialogContent>
            <DialogActions>
                <Button onClick={handleDialogClose}>Cancel</Button>
                <Button onClick={handleConfirmRestChange}>Confirm</Button>
            </DialogActions>
        </Dialog>
    </>;
};

