import { LoadingButton } from "@mui/lab";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Switch } from "@mui/material";
import Grid from '@mui/material/Grid2';
import { WgerTextField } from "components/Common/forms/WgerTextField";
import { Day } from "components/WorkoutRoutines/models/Day";
import { useEditDayQuery } from "components/WorkoutRoutines/queries";
import { Form, Formik } from "formik";
import React, { useState } from "react";
import * as Yup from 'yup';

export const DayForm = (props: { day: Day, routineId: number }) => {
    const editDayQuery = useEditDayQuery(props.routineId);

    const [openDialog, setOpenDialog] = useState(false);
    const [isRest, setIsRest] = useState(props.day.isRest);

    const handleRestChange = () => setOpenDialog(true);
    const handleDialogClose = () => setOpenDialog(false);
    const handleConfirmRestChange = () => {
        handleSubmit({ isRest: !isRest });
        setIsRest(!isRest);
        setOpenDialog(false);
    };

    const validationSchema = Yup.object().shape({
        name: Yup.string()
            .min(3, 'Name must be at least 3 characters')
            .max(20, 'Name must be at most 20 characters')
            .required('Name is required'),
        description: Yup.string()
            .max(1000, 'Description must be at most 1000 characters'),
        isRest: Yup.boolean()
    });

    const handleSubmit = (values: Partial<{ name: string, description: string, isRest: boolean }>) =>
        editDayQuery.mutate({
            id: props.day.id,
            routine: props.routineId,
            ...(values.name !== undefined && { name: values.name }),
            ...(values.description !== undefined && { description: values.description }),
            ...(values.isRest !== undefined && { is_rest: values.isRest }),
        });

    return <>
        <Formik
            initialValues={{ name: props.day.name, description: props.day.description, isRest: props.day.isRest }}
            validationSchema={validationSchema}
            onSubmit={(values, { setSubmitting }) => {
                handleSubmit(values);
                setSubmitting(false);
            }}
            initialTouched={{ name: true, description: true, isRest: true }}
        >
            {(formik) => (
                <Form>
                    <Grid container spacing={2}>
                        <Grid size={10}>
                            <WgerTextField
                                fieldName="name"
                                title="Name"
                                fieldProps={{ disabled: isRest }}
                            />

                        </Grid>
                        <Grid size={2}>
                            <FormControlLabel
                                control={<Switch checked={isRest} onChange={handleRestChange} />}
                                label="rest day" />
                        </Grid>
                        <Grid size={12}>
                            <WgerTextField
                                fieldName="description"
                                title="Description"
                                fieldProps={{ multiline: true, rows: 4, disabled: isRest }}
                            />

                        </Grid>
                        <Grid size={12}>
                            {editDayQuery.isPending
                                ? <LoadingButton loading variant="contained" color="primary">
                                    Save
                                </LoadingButton>
                                : <Button
                                    variant="contained"
                                    color="primary"
                                    type="submit"
                                    disabled={isRest}
                                >
                                    Save
                                </Button>
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
                </Form>
            )}
        </Formik>
    </>;
};

