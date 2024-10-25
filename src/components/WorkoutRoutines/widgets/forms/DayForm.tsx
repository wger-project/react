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
            .max(255, 'Description must be at most 255 characters'),
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
                        <Grid item xs={10}>
                            <TextField
                                fullWidth
                                label="Name"
                                variant="standard"
                                disabled={isRest}
                                {...formik.getFieldProps('name')}
                                error={formik.touched.name && Boolean(formik.errors.name)}
                                helperText={formik.touched.name && formik.errors.name}
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
                                {...formik.getFieldProps('description')}
                                disabled={isRest}
                                error={formik.touched.description && Boolean(formik.errors.description)}
                                helperText={formik.touched.description && formik.errors.description}
                                multiline
                                rows={4}
                            />
                        </Grid>
                        <Grid item xs={12}>
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

