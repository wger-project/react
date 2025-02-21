import DeleteIcon from "@mui/icons-material/Delete";
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
import { DeleteConfirmationModal } from "components/Core/Modals/DeleteConfirmationModal";
import { Day } from "components/WorkoutRoutines/models/Day";
import { useDeleteDayQuery, useEditDayQuery } from "components/WorkoutRoutines/queries";
import { DefaultRoundingMenu } from "components/WorkoutRoutines/widgets/forms/RoutineForm";
import { Form, Formik } from "formik";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import * as Yup from 'yup';

export const DayForm = (props: {
    day: Day,
    routineId: number,
    setSelectedDayIndex: (day: number | null) => void
}) => {
    const { t } = useTranslation();
    const editDayQuery = useEditDayQuery(props.routineId);
    const deleteDayQuery = useDeleteDayQuery(props.routineId);

    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [isRest, setIsRest] = useState(props.day.isRest);

    const handleRestChange = () => {
        if (!isRest) {
            setOpenDialog(true);
        } else {
            setIsRest(false);
            handleSubmit({ isRest: false });
        }
    };
    const handleDialogClose = () => setOpenDialog(false);
    const handleConfirmRestChange = () => {
        handleSubmit({ isRest: !isRest });
        setIsRest(!isRest);
        setOpenDialog(false);
    };

    const handleDeleteDay = () => setOpenDeleteDialog(true);

    const handleConfirmDeleteDay = () => {
        props.setSelectedDayIndex(null);
        deleteDayQuery.mutate(props.day.id);
        setOpenDeleteDialog(false);
    };

    const handleCancelDeleteDay = () => setOpenDeleteDialog(false);


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
            ...(values.isRest !== undefined && { is_rest: isRest }),
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
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <WgerTextField
                                fieldName="name"
                                title="Name"
                                fieldProps={{ disabled: isRest }}
                            />

                        </Grid>
                        <Grid size={{ xs: 6, sm: 2 }}>
                            <FormControlLabel
                                control={<Switch checked={isRest} onChange={handleRestChange} />}
                                label={t('routines.restDay')} />
                        </Grid>
                        <Grid size={{ xs: 6, sm: 4 }}>
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

                        <Grid size={8}>
                            {editDayQuery.isPending
                                ? <LoadingButton loading variant="contained" color="primary">
                                    {t('save')}
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

                            &nbsp;

                            <Button
                                variant="outlined"
                                startIcon={<DeleteIcon />}
                                onClick={handleDeleteDay}
                                disabled={editDayQuery.isPending}
                            >
                                {t('delete')}
                            </Button>
                        </Grid>
                        <Grid size={4} sx={{ display: "flex", justifyContent: "flex-end" }}>
                            <DefaultRoundingMenu routineId={props.routineId} />
                        </Grid>
                    </Grid>

                    <Dialog open={openDialog} onClose={handleDialogClose}>
                        <DialogTitle>{t('routines.confirmRestDay')}</DialogTitle>
                        <DialogContent>
                            {t('routines.confirmRestDayHelpText')}
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleDialogClose}>{t('cancel')}</Button>
                            <Button onClick={handleConfirmRestChange}>{t('continue')}</Button>
                        </DialogActions>
                    </Dialog>

                    <DeleteConfirmationModal
                        title={t('deleteConfirmation', { name: props.day.getDisplayName() })}
                        message={t('routines.deleteDayConfirmation')}
                        isOpen={openDeleteDialog}
                        closeFn={handleCancelDeleteDay}
                        deleteFn={handleConfirmDeleteDay}
                    />
                </Form>
            )}
        </Formik>
    </>;
};

