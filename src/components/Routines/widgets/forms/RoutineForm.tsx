import HelpOutlineIcon from "@mui/icons-material/HelpOutlined";
import { Button, FormControlLabel, IconButton, Menu, MenuItem, Stack, Switch } from "@mui/material";
import Grid from '@mui/material/Grid';
import Tooltip from "@mui/material/Tooltip";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import { useAppForm } from "@/core/forms/appForm";
import { fieldErrorMessage, yupSchema } from "@/core/forms/formUtils";
import { FormQueryErrors } from "@/core/ui/Widgets/FormError";
import { useProfileQuery } from "@/components/User";
import {
    DESCRIPTION_MAX_LENGTH,
    MAX_WORKOUT_DURATION,
    MIN_WORKOUT_DURATION,
    NAME_MAX_LENGTH,
    NAME_MIN_LENGTH,
    Routine
} from "@/components/Routines/models/Routine";
import { useAddRoutineQuery, useEditRoutineQuery } from "@/components/Routines/queries/routines";
import { SlotEntryRoundingField } from "@/components/Routines/widgets/forms/SlotEntryForm";
import { DateTime } from "luxon";
import React, { useState } from 'react';
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { makeLink, WgerLink } from "@/core/lib/url";
import * as yup from 'yup';

interface RoutineFormProps {
    existingRoutine?: Routine,
    isTemplate?: boolean,
    isPublicTemplate?: boolean,
    closeFn?: () => void,
}

interface RoutineFormValues {
    name: string,
    description: string,
    // What the pickers hand over; yup casts the ISO string a DateTime prints as
    start: DateTime,
    end: DateTime,
    fitInWeek: boolean,
}

export const RoutineForm = ({
                                existingRoutine,
                                isTemplate = false,
                                isPublicTemplate = false,
                                closeFn
                            }: RoutineFormProps) => {

    const [t, i18n] = useTranslation();
    const addRoutineQuery = useAddRoutineQuery();
    const editRoutineQuery = useEditRoutineQuery(existingRoutine?.id ?? -1);
    const navigate = useNavigate();

    const routine = existingRoutine
        ? Routine.clone(existingRoutine)
        : new Routine({
            isTemplate: isTemplate,
            isPublic: isPublicTemplate
        });

    // The pickers keep their own copy of the dates, the duration below reads it
    const [startDate, setStartDate] = useState<DateTime>(DateTime.fromJSDate(routine.start));
    const [endDate, setEndDate] = useState<DateTime>(DateTime.fromJSDate(routine.end));

    const duration = endDate.diff(startDate, ['weeks', 'days']);
    const durationWeeks = Math.floor(duration.weeks);
    const durationDays = Math.floor(duration.days);

    const validationSchema = yup.object({
        name: yup
            .string()
            .required()
            .max(NAME_MAX_LENGTH, t('forms.maxLength', { chars: NAME_MAX_LENGTH }))
            .min(NAME_MIN_LENGTH, t('forms.minLength', { chars: NAME_MIN_LENGTH })),
        description: yup
            .string()
            .max(DESCRIPTION_MAX_LENGTH, t('forms.maxLength', { chars: DESCRIPTION_MAX_LENGTH })),
        start: yup
            .date()
            .required(),
        end: yup
            .date()
            .required()
            .min(
                yup.ref('start'),
                t('forms.endBeforeStart')
            )
            .test(
                'hasMinimumDuration',
                t('routines.minLengthRoutine', { number: MIN_WORKOUT_DURATION }),
                function (value) {
                    const startDate = this.parent.start;
                    if (startDate && value) {
                        const startDateTime = DateTime.fromJSDate(startDate);
                        const endDateTime = DateTime.fromJSDate(value);

                        return endDateTime.diff(startDateTime, 'weeks').weeks >= MIN_WORKOUT_DURATION;
                    }
                    return true;
                }
            )
            .test(
                'hasMaximumDuration',
                t('routines.maxLengthRoutine', { number: MAX_WORKOUT_DURATION }),
                function (value) {
                    const startDate = this.parent.start;
                    if (startDate && value) {
                        const startDateTime = DateTime.fromJSDate(startDate);
                        const endDateTime = DateTime.fromJSDate(value);

                        return endDateTime.diff(startDateTime, 'weeks').weeks <= MAX_WORKOUT_DURATION;
                    }
                    return true;
                }
            ),
        fitInWeek: yup.boolean()
    });

    const defaultValues: RoutineFormValues = {
        name: routine.name,
        description: routine.description,
        start: startDate,
        end: endDate,
        fitInWeek: routine.fitInWeek,
    };

    const form = useAppForm({
        defaultValues,
        validators: { onChange: yupSchema<RoutineFormValues>(validationSchema) },
        onSubmit: async ({ value }) => {
            routine.name = value.name;
            routine.description = value.description;
            routine.fitInWeek = value.fitInWeek;
            routine.start = value.start.toJSDate();
            routine.end = value.end.toJSDate();

            if (routine.id !== null) {
                editRoutineQuery.mutate(routine);
            } else {
                const result = await addRoutineQuery.mutateAsync(routine);
                navigate(makeLink(WgerLink.ROUTINE_EDIT, i18n.language, { id: result.id! }));

                if (closeFn) {
                    closeFn();
                }
            }
        },
    });

    return (
        <form onSubmit={e => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
        }}>
            <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                    <FormQueryErrors
                        mutationQuery={routine?.id ? editRoutineQuery : addRoutineQuery} />
                </Grid>

                <Grid size={{ xs: 12 }}>
                    <form.AppField name="name">
                        {field => <field.WgerTextField title={t('name')} />}
                    </form.AppField>
                </Grid>
                <Grid size={12}>
                    <form.AppField name="description">
                        {field => <field.WgerTextField
                            title={t('description')}
                            fieldProps={{ multiline: true, rows: 4 }}
                        />}
                    </form.AppField>
                </Grid>
                <Grid size={{ xs: 6 }}>
                    <LocalizationProvider dateAdapter={AdapterLuxon} adapterLocale={i18n.language}>
                        <form.Field name="start">
                            {field => {
                                const error = field.state.meta.isTouched
                                    ? fieldErrorMessage(field.state.meta.errors)
                                    : undefined;
                                return <DatePicker
                                    defaultValue={DateTime.now()}
                                    label={t('start')}
                                    value={startDate}
                                    onChange={(newValue) => {
                                        if (newValue) {
                                            field.handleChange(newValue);
                                            setStartDate(newValue);
                                        }
                                    }}
                                    slotProps={{
                                        textField: {
                                            variant: "standard",
                                            fullWidth: true,
                                            error: error !== undefined,
                                            helperText: error ?? ''
                                        }
                                    }}
                                />;
                            }}
                        </form.Field>
                    </LocalizationProvider>
                </Grid>
                <Grid size={{ xs: 5 }}>
                    <LocalizationProvider dateAdapter={AdapterLuxon} adapterLocale={i18n.language}>
                        <form.Field name="end">
                            {field => {
                                const error = field.state.meta.isTouched
                                    ? fieldErrorMessage(field.state.meta.errors)
                                    : undefined;
                                return <DatePicker
                                    defaultValue={DateTime.now()}
                                    label={t('end')}
                                    value={endDate}
                                    onChange={(newValue) => {
                                        if (newValue) {
                                            field.handleChange(newValue);
                                            setEndDate(newValue);
                                        }
                                    }}
                                    slotProps={{
                                        textField: {
                                            variant: "standard",
                                            fullWidth: true,
                                            error: error !== undefined,
                                            helperText: error ?? ''
                                        }
                                    }}
                                />;
                            }}
                        </form.Field>
                    </LocalizationProvider>
                </Grid>
                <Grid
                    size={{ xs: 1 }}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center"
                    }}
                >
                    {durationDays === 0 ? t('durationWeeks', { number: durationWeeks }) : t('durationWeeksDays', {
                        nrWeeks: durationWeeks,
                        nrDays: durationDays
                    })}
                </Grid>
                <Grid size={12}>
                    <form.Field name="fitInWeek">
                        {field => <FormControlLabel
                            control={
                                <Switch
                                    name={field.name}
                                    checked={field.state.value}
                                    onChange={event => field.handleChange(event.target.checked)}
                                    onBlur={field.handleBlur}
                                />
                            }
                            label={t('routines.fitDaysInWeek')} />}
                    </form.Field>
                    <Tooltip title={t('routines.fitDaysInWeekHelpText')}>
                        <IconButton size="small">
                            <HelpOutlineIcon fontSize="inherit" />
                        </IconButton>
                    </Tooltip>
                </Grid>
                <Grid size={12}>
                    <form.Subscribe selector={state => state.isSubmitting}>
                        {isSubmitting => <Button
                            disabled={isSubmitting}
                            color="primary"
                            variant="contained"
                            type="submit"
                            sx={{ mt: 2 }}>
                            {t('save')}
                        </Button>}
                    </form.Subscribe>
                </Grid>
            </Grid>
        </form>
    );
};


export const DefaultRoundingMenu = (props: { routineId: number }) => {
    const userProfileQuery = useProfileQuery();
    const { t } = useTranslation();

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <Stack direction={"row"}>
            <Button
                variant="text"
                id="basic-button"
                aria-controls={open ? 'basic-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
            >
                {t('routines.defaultRounding')}
            </Button>
            <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                slotProps={{
                    list: {
                        'aria-labelledby': 'basic-button',
                    },
                }}
            >

                <MenuItem>
                    <SlotEntryRoundingField
                        routineId={props.routineId}
                        rounding="weight"
                        editProfile={true}
                        initialValue={userProfileQuery.data!.weightRounding}
                    />
                </MenuItem>
                <MenuItem>
                    <SlotEntryRoundingField
                        routineId={props.routineId}
                        rounding="reps"
                        editProfile={true}
                        initialValue={userProfileQuery.data!.repetitionsRounding}
                    />
                </MenuItem>
            </Menu>
            <Tooltip title={t('routines.roundingHelp')}>
                <IconButton onClick={() => {
                }}>
                    <HelpOutlineIcon fontSize="small" />
                </IconButton>
            </Tooltip>
        </Stack>
    );
};
