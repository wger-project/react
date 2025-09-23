import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { Button, FormControlLabel, IconButton, Menu, MenuItem, Stack, Switch } from "@mui/material";
import Grid from '@mui/material/Grid';
import Tooltip from "@mui/material/Tooltip";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import { WgerTextField } from "components/Common/forms/WgerTextField";
import { useProfileQuery } from "components/User/queries/profile";
import {
    DEFAULT_WORKOUT_DURATION,
    DESCRIPTION_MAX_LENGTH,
    MAX_WORKOUT_DURATION,
    MIN_WORKOUT_DURATION,
    NAME_MAX_LENGTH,
    NAME_MIN_LENGTH,
    Routine
} from "components/WorkoutRoutines/models/Routine";
import { useAddRoutineQuery, useEditRoutineQuery } from "components/WorkoutRoutines/queries/routines";
import { SlotEntryRoundingField } from "components/WorkoutRoutines/widgets/forms/SlotEntryForm";
import { Form, Formik } from "formik";
import { DateTime } from "luxon";
import React, { useState } from 'react';
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { makeLink, WgerLink } from "utils/url";
import * as yup from 'yup';

interface RoutineFormProps {
    routine?: Routine,
    isTemplate?: boolean,
    isPublicTemplate?: boolean,
    closeFn?: Function,
}

export const RoutineForm = ({ routine, isTemplate = true, isPublicTemplate = true, closeFn }: RoutineFormProps) => {

    const [t, i18n] = useTranslation();
    const addRoutineQuery = useAddRoutineQuery();
    const editRoutineQuery = useEditRoutineQuery(routine?.id ?? -1);
    const navigate = useNavigate();

    /*
     * Note: Controlling the state of the dates manually, otherwise some undebuggable errors
     *       about missing properties occur deep within formik.
     */
    const [startDate, setStartDate] = useState<DateTime>(routine ? DateTime.fromJSDate(routine.start) : DateTime.now());
    const [endDate, setEndDate] = useState<DateTime>(routine ? DateTime.fromJSDate(routine.end) : DateTime.now().plus({ weeks: DEFAULT_WORKOUT_DURATION }));

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


    return (
        (<Formik
            initialValues={{
                name: routine ? routine.name : '',
                description: routine ? routine.description : '',
                start: startDate,
                end: endDate,
                fitInWeek: routine ? routine.fitInWeek : true
            }}

            validationSchema={validationSchema}
            onSubmit={async (values) => {
                if (routine) {
                    const newRoutine = Routine.clone(routine);
                    newRoutine.fitInWeek = values.fitInWeek;
                    newRoutine.name = values.name;
                    newRoutine.description = values.description;
                    newRoutine.start = values.start!.toJSDate();
                    newRoutine.end = values.end!.toJSDate();
                    editRoutineQuery.mutate(newRoutine);

                } else {
                    const result = await addRoutineQuery.mutateAsync(new Routine({
                        id: null,
                        name: values.name,
                        description: values.description,
                        created: new Date(),
                        start: values.start!.toJSDate(),
                        end: values.end?.toJSDate(),
                        fitInWeek: values.fitInWeek,
                        isTemplate: isTemplate,
                        isPublic: isPublicTemplate
                    }));

                    navigate(makeLink(WgerLink.ROUTINE_EDIT, i18n.language, { id: result.id! }));

                    if (closeFn) {
                        closeFn();
                    }
                }
            }}
        >
            {formik => (
                <Form>
                    <Grid container spacing={2}>

                        <Grid size={{ xs: 12 }}>
                            <WgerTextField fieldName="name" title={t('name')} />
                        </Grid>
                        <Grid size={12}>
                            <WgerTextField
                                fieldName="description"
                                title={t('description')}
                                fieldProps={{ multiline: true, rows: 4 }}
                            />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <LocalizationProvider dateAdapter={AdapterLuxon} adapterLocale={i18n.language}>
                                <DatePicker
                                    defaultValue={DateTime.now()}
                                    label={t('start')}
                                    value={startDate}
                                    onChange={(newValue) => {
                                        if (newValue) {
                                            formik.setFieldValue('start', newValue);
                                            setStartDate(newValue);
                                        }
                                    }}
                                    slotProps={{
                                        textField: {
                                            variant: "standard",
                                            fullWidth: true,
                                            error: formik.touched.start && Boolean(formik.errors.start),
                                            helperText: formik.touched.start && formik.errors.start ? String(formik.errors.start) : ''
                                        }
                                    }}
                                />
                            </LocalizationProvider>
                        </Grid>
                        <Grid size={{ xs: 5 }}>
                            <LocalizationProvider dateAdapter={AdapterLuxon} adapterLocale={i18n.language}>
                                <DatePicker
                                    defaultValue={DateTime.now()}
                                    label={t('end')}
                                    value={endDate}
                                    onChange={(newValue) => {
                                        if (newValue) {
                                            formik.setFieldValue('end', newValue);
                                            setEndDate(newValue);
                                        }
                                    }}
                                    slotProps={{
                                        textField: {
                                            variant: "standard",
                                            fullWidth: true,
                                            error: formik.touched.end && Boolean(formik.errors.end),
                                            helperText: formik.touched.end && formik.errors.end ? String(formik.errors.end) : ''
                                        }
                                    }}
                                />
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
                            <FormControlLabel
                                control={
                                    <Switch checked={formik.values.fitInWeek} {...formik.getFieldProps('fitInWeek')} />
                                }
                                label={t('routines.fitDaysInWeek')} />
                            <Tooltip title={t('routines.fitDaysInWeekHelpText')}>
                                <IconButton size="small">
                                    <HelpOutlineIcon fontSize="inherit" />
                                </IconButton>
                            </Tooltip>
                        </Grid>
                        <Grid size={12}>
                            <Button
                                disabled={formik.isSubmitting}
                                color="primary"
                                variant="contained"
                                type="submit"
                                sx={{ mt: 2 }}>
                                {t('save')}
                            </Button>
                        </Grid>
                    </Grid>
                </Form>
            )}
        </Formik>)
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
                MenuListProps={{
                    'aria-labelledby': 'basic-button',
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