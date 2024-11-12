import { Button, FormControlLabel, Switch } from "@mui/material";
import Grid from '@mui/material/Grid2';
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import { WgerTextField } from "components/Common/forms/WgerTextField";
import { Routine } from "components/WorkoutRoutines/models/Routine";
import { useAddRoutineQuery, useEditRoutineQuery } from "components/WorkoutRoutines/queries/routines";
import { Form, Formik } from "formik";
import { DateTime } from "luxon";
import React, { useState } from 'react';
import { useTranslation } from "react-i18next";
import { DEFAULT_WORKOUT_DURATION, MAX_WORKOUT_DURATION, MIN_WORKOUT_DURATION } from "utils/consts";
import * as yup from 'yup';

interface RoutineFormProps {
    routine?: Routine,
    closeFn?: Function,
}

export const RoutineForm = ({ routine, closeFn }: RoutineFormProps) => {

    const [t, i18n] = useTranslation();
    const addRoutineQuery = useAddRoutineQuery();
    const editRoutineQuery = useEditRoutineQuery(routine?.id!);

    /*
     * Note: Controlling the state of the dates manually, otherwise some undebuggable errors
     *       about missing properties occur deep within formik.
     */
    const [startValue, setStartValue] = useState<DateTime | null>(routine ? DateTime.fromJSDate(routine.start) : DateTime.now());
    const [endValue, setEndValue] = useState<DateTime | null>(routine ? DateTime.fromJSDate(routine.end) : DateTime.now().plus({ weeks: DEFAULT_WORKOUT_DURATION }));

    const nameMinLength = 3;
    const nameMaxLength = 25;
    const descriptionMaxLength = 1000;

    const validationSchema = yup.object({
        name: yup
            .string()
            .required()
            .max(nameMaxLength, t('forms.maxLength', { chars: nameMaxLength }))
            .min(nameMinLength, t('forms.minLength', { chars: nameMinLength })),
        description: yup
            .string()
            .max(descriptionMaxLength, t('forms.maxLength', { chars: descriptionMaxLength })),
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
                start: startValue,
                end: endValue,
                fitInWeek: routine ? routine.fitInWeek : false
            }}

            validationSchema={validationSchema}
            onSubmit={async (values) => {
                if (routine) {
                    editRoutineQuery.mutate({
                        ...values,
                        fit_in_week: values.fitInWeek,
                        start: values.start?.toISODate()!,
                        end: values.end?.toISODate()!,
                        id: routine.id
                    });
                } else {
                    addRoutineQuery.mutate({
                        ...values,
                        fit_in_week: values.fitInWeek,
                        start: values.start?.toISODate()!,
                        end: values.end?.toISODate()!,
                    });
                }

                // if closeFn is defined, close the modal (this form does not have to be displayed in one)
                if (closeFn) {
                    closeFn();
                }
            }}
        >
            {formik => (
                <Form>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <WgerTextField fieldName="name" title={t('name')} />
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                            <LocalizationProvider dateAdapter={AdapterLuxon} adapterLocale={i18n.language}>
                                <DatePicker
                                    defaultValue={DateTime.now()}
                                    label={t('start')}
                                    value={startValue}
                                    onChange={(newValue) => {
                                        if (newValue) {
                                            formik.setFieldValue('start', newValue);
                                        }
                                        setStartValue(newValue);
                                    }}
                                    slotProps={{
                                        textField: {
                                            variant: "standard",
                                            fullWidth: true,
                                            error: formik.touched.start && Boolean(formik.errors.start),
                                            helperText: formik.touched.start && formik.errors.start
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
                                    value={endValue}
                                    onChange={(newValue) => {
                                        if (newValue) {
                                            formik.setFieldValue('end', newValue);
                                        }
                                        setEndValue(newValue);
                                    }}
                                    slotProps={{
                                        textField: {
                                            variant: "standard",
                                            fullWidth: true,
                                            error: formik.touched.end && Boolean(formik.errors.end),
                                            helperText: formik.touched.end && formik.errors.end
                                        }
                                    }}
                                />
                            </LocalizationProvider>
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
                                label="Fit days in week." />
                        </Grid>
                        <Grid size={12}>
                            <Button
                                disabled={formik.isSubmitting}
                                color="primary"
                                variant="contained"
                                type="submit"
                                sx={{ mt: 2 }}>
                                {t('submit')}
                            </Button>
                        </Grid>

                    </Grid>
                </Form>
            )}
        </Formik>)
    );
};
