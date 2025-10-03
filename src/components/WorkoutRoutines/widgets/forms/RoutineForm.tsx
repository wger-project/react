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
import { SaveButton } from "components/WorkoutRoutines/widgets/SaveButton";
import { Form, Formik } from "formik";
import { FormQueryErrors } from "components/Core/Widgets/FormError";
import { DateTime } from "luxon";
import React, { useState } from 'react';
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { makeLink, WgerLink } from "utils/url";
import * as yup from 'yup';

interface RoutineFormProps {
    routine?: Routine,
    closeFn?: Function,
}


export const RoutineForm = ({ routine, closeFn }: RoutineFormProps) => {

    const [t, i18n] = useTranslation();
    const addRoutineQuery = useAddRoutineQuery();
    const editRoutineQuery = useEditRoutineQuery(routine?.id!);
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

    // new handle save
    const handleSave = async (values: any) => {
        if (routine) {
            // when editing routine
            const updatedRoutine: Routine = new Routine({
                id: routine.id,
                name: values.name,
                description: values.description ?? '',
                created: routine.created,
                start: values.start?.toJSDate() ?? routine.start,
                end: values.end?.toJSDate() ?? routine.end,
                fitInWeek: values.fitInWeek ?? routine.fitInWeek,
                isTemplate: routine.isTemplate,
                isPublic: routine.isPublic,
                days: routine.days,
                dayData: routine.dayData,
            });

            await editRoutineQuery.mutateAsync(updatedRoutine);
        } else {
            // when creating a new routine
            const newRoutine: Routine = new Routine({
                id: null,
                name: values.name,
                description: values.description ?? '',
                created: new Date(),
                start: values.start?.toJSDate() ?? new Date(),
                end: values.end?.toJSDate() ?? new Date(),
                fitInWeek: values.fitInWeek ?? true,
                isTemplate: false,
                isPublic: false,
                days: [],
                dayData: [],
            });

            const result = await addRoutineQuery.mutateAsync(newRoutine);

            navigate(makeLink(WgerLink.ROUTINE_EDIT, i18n.language, { id: result.id! }));

            if (closeFn) {
                closeFn();
            }
        }
    };

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

            onSubmit={handleSave} // use the new handle save

        >
            {formik => (
                <Form>
                    <Grid container spacing={2}>
                        <Grid size={12}>
                            <FormQueryErrors mutationQuery={routine ? editRoutineQuery : addRoutineQuery} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 5 }}>
                            <WgerTextField fieldName="name" title={t('name')} />
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
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
                        <Grid size={{ xs: 6, sm: 3 }}>
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
                            size={{ xs: 12, sm: 1 }}
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
                            <WgerTextField
                                fieldName="description"
                                title={t('description')}
                                fieldProps={{ multiline: true, rows: 4 }}
                            />
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
                            <SaveButton
                                onSave={async () => {
                                    const errors = await formik.validateForm();
                                    if (Object.keys(errors).length > 0) {
                                        formik.setTouched(
                                            Object.keys(errors).reduce((acc, key) => ({
                                                ...acc,
                                                [key]: true
                                            }), {})
                                        );
                                        throw new Error('validation error');
                                    }

                                    await formik.submitForm();
                                }}
                                loadingText={t('saving', 'Saving...')}
                                successText={`${t('save', 'Saved')} ✅`}
                                errorText={`${t('save')} ❌`}
                                defaultText={t('save')}
                                variant="contained"
                                color="primary"
                                type="submit"
                                sx={{ mt: 2 }}
                            />
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