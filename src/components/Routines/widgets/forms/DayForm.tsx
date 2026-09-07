import DeleteIcon from "@mui/icons-material/Delete";
import HelpOutlineIcon from "@mui/icons-material/HelpOutlined";
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
import LoadingButton from "@mui/material/Button";
import Grid from '@mui/material/Grid';
import { useAppForm } from "@/core/forms/appForm";
import { yupSchema, submitHandler } from "@/core/forms/formUtils";
import { FormQueryErrorsSnackbar } from "@/core/ui/Widgets/FormError";
import { DeleteConfirmationModal } from "@/core/ui/Modals/DeleteConfirmationModal";
import { Day, DayType } from "@/components/Routines/models/Day";
import { useDeleteDayQuery, useEditDayQuery } from "@/components/Routines/queries";
import { DayTypeSelect } from "@/components/Routines/widgets/forms/DayTypeSelect";
import { DefaultRoundingMenu } from "@/components/Routines/widgets/forms/RoutineForm";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import * as Yup from 'yup';

interface DayFormValues {
    name: string,
    description: string,
    isRest: boolean,
    needsLogsToAdvance: boolean,
    type: string,
}

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
    const [isRestDay, setIsRestDay] = useState(props.day.isRest);

    const handleRestDayChange = () => {
        if (isRestDay) {
            setIsRestDay(false);
            handleSubmit({ isRest: false });
        } else {
            setOpenDialog(true);
        }
    };
    const handleDialogClose = () => setOpenDialog(false);
    const handleConfirmRestChange = () => {
        setIsRestDay(true);
        handleSubmit({ isRest: true });
        setOpenDialog(false);
    };

    const handleDeleteDay = () => setOpenDeleteDialog(true);

    const handleConfirmDeleteDay = () => {
        props.setSelectedDayIndex(null);
        deleteDayQuery.mutate(props.day.id!);
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
        needsLogsToAdvance: Yup.boolean(),
        type: Yup.string(),
    });

    const handleSubmit = (values: Partial<DayFormValues>) =>
        editDayQuery.mutate(Day.clone(
            props.day,
            {
                ...(values.name !== undefined && { name: values.name }),
                ...(values.description !== undefined && { description: values.description }),
                ...({ isRest: values.isRest }),
                ...(values.needsLogsToAdvance !== undefined && { needLogsToAdvance: values.needsLogsToAdvance }),
                ...(values.type !== undefined && { type: values.type as DayType }),
            })
        );

    const defaultValues: DayFormValues = {
        name: props.day.name,
        description: props.day.description,
        isRest: props.day.isRest,
        needsLogsToAdvance: props.day.needLogsToAdvance,
        type: props.day.type,
    };

    const form = useAppForm({
        defaultValues,
        validators: { onChange: yupSchema<DayFormValues>(validationSchema) },
        onSubmit: async ({ value }) => handleSubmit(value),
    });

    return <>
        <form onSubmit={submitHandler(form)}>
            <FormQueryErrorsSnackbar mutationQuery={editDayQuery} />
            <FormQueryErrorsSnackbar mutationQuery={deleteDayQuery} />
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <form.AppField name="name">
                        {field => <field.WgerTextField variant="standard"
                            title="Name"
                            fieldProps={{ disabled: isRestDay }}
                        />}
                    </form.AppField>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <form.AppField name="type">
                        {() => <DayTypeSelect />}
                    </form.AppField>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                    <FormControlLabel
                        control={<Switch checked={isRestDay} onChange={handleRestDayChange} />}
                        label={t('routines.restDay')} />
                </Grid>
                <Grid size={{ xs: 12, sm: 4, md: 3 }}>
                    <form.Field name="needsLogsToAdvance">
                        {field => <FormControlLabel
                            disabled={isRestDay}
                            control={<Switch
                                name={field.name}
                                checked={field.state.value}
                                onChange={event => field.handleChange(event.target.checked)}
                                onBlur={field.handleBlur}
                            />}
                            label={t('routines.needsLogsToAdvance')} />}
                    </form.Field>
                    <Tooltip title={t('routines.needsLogsToAdvanceHelpText')}>
                        <IconButton onClick={() => {
                        }}>
                            <HelpOutlineIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Grid>
                <Grid size={12}>
                    <form.AppField name="description">
                        {field => <field.WgerTextField variant="standard"
                            title="Description"
                            fieldProps={{ multiline: true, rows: 4, disabled: isRestDay }}
                        />}
                    </form.AppField>
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
                            disabled={isRestDay}
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
                title={t('deleteConfirmation', { name: props.day.displayName })}
                message={t('routines.deleteDayConfirmation')}
                isOpen={openDeleteDialog}
                closeFn={handleCancelDeleteDay}
                deleteFn={handleConfirmDeleteDay}
            />
        </form>
    </>;
};
