import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { LoadingButton } from "@mui/lab";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    IconButton,
    Switch,
    Tooltip
} from "@mui/material";
import Grid from '@mui/material/Grid2';
import { WgerTextField } from "components/Common/forms/WgerTextField";
import { Day } from "components/WorkoutRoutines/models/Day";
import { useEditDayQuery } from "components/WorkoutRoutines/queries";
import { Form, Formik } from "formik";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import * as Yup from 'yup';

export const DayForm = (props: { day: Day, routineId: number }) => {
    const [t, i18n] = useTranslation();

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


    const nameMinLength = 3;
    const nameMaxLength = 20;
    const descriptionMaxLength = 1000;

    const validationSchema = Yup.object().shape({
        name: Yup.string()
            .max(nameMaxLength, t('forms.maxLength', { chars: nameMaxLength }))
            .min(nameMinLength, t('forms.minLength', { chars: nameMinLength }))
            .required('Name is required'),
        description: Yup.string()
            .max(descriptionMaxLength, t('forms.maxLength', { chars: descriptionMaxLength })),
        isRest: Yup.boolean(),
        needsLogsToAdvance: Yup.boolean()
    });

    const handleSubmit = (values: Partial<{
        name: string,
        description: string,
        isRest: boolean,
        needsLogsToAdvance: boolean
    }>) =>
        editDayQuery.mutate({
            id: props.day.id,
            routine: props.routineId,
            ...(values.name !== undefined && { name: values.name }),
            ...(values.description !== undefined && { description: values.description }),
            ...(values.isRest !== undefined && { is_rest: values.isRest }),
            ...(values.needsLogsToAdvance !== undefined && { needs_logs_to_advance: values.needsLogsToAdvance }),
        });

    return <>
        <Formik
            initialValues={{
                name: props.day.name,
                description: props.day.description,
                isRest: props.day.isRest,
                needsLogsToAdvance: props.day.needLogsToAdvance
            }}
            validationSchema={validationSchema}
            onSubmit={(values, { setSubmitting }) => {
                handleSubmit(values);
                setSubmitting(false);
            }}
            initialTouched={{ name: true, description: true, isRest: true, needsLogsToAdvance: true }}
        >
            {(formik) => (
                <Form>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 7 }}>
                            <WgerTextField
                                fieldName="name"
                                title="Name"
                                fieldProps={{ disabled: isRest }}
                            />

                        </Grid>
                        <Grid size={{ xs: 6, sm: 2 }}>
                            <FormControlLabel
                                control={<Switch checked={isRest} onChange={handleRestChange} />}
                                label="rest day" />
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                            <FormControlLabel
                                disabled={isRest}
                                control={<Switch
                                    checked={formik.values.needsLogsToAdvance}
                                    {...formik.getFieldProps('needsLogsToAdvance')}
                                />}
                                label={t('routines.needsLogsToAdvance')} />
                            <Tooltip title={t('routines.needsLogsToAdvanceHelpText')}>
                                <IconButton onClick={() => {
                                }}>
                                    <HelpOutlineIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
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
                                    {t('save')}
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
                            Please consider that all sets are removed from rest days when the form is saved
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleDialogClose}>Cancel</Button>
                            <Button onClick={handleConfirmRestChange}>Save</Button>
                        </DialogActions>
                    </Dialog>
                </Form>
            )}
        </Formik>
    </>;
};

