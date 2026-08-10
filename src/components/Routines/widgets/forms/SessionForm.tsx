import {
    IMPRESSION_BAD,
    IMPRESSION_GOOD,
    IMPRESSION_NEUTRAL,
    NOTES_MAX_LENGTH,
    WorkoutSession
} from "@/components/Routines/models/WorkoutSession";
import { useAddSessionQuery, useEditSessionQuery, useFindSessionQuery } from "@/components/Routines/queries";
import { WgerTextField } from "@/core/forms/WgerTextField";
import { dateToYYYYMMDD } from "@/core/lib/date";
import { SentimentNeutral, SentimentSatisfiedAlt, SentimentVeryDissatisfied } from "@mui/icons-material";
import { Button, ButtonGroup, Typography } from "@mui/material";
import Grid from '@mui/material/Grid';
import { DatePicker, LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import { Form, Formik, FormikProps } from "formik";
import { DateTime } from "luxon";
import React, { useEffect, useRef } from 'react';
import { useTranslation } from "react-i18next";
import * as yup from 'yup';

interface SessionFormProps {
    initialSession?: WorkoutSession;
    dayId: number,
    routineId: number,
    selectedDate: DateTime,
    setSelectedDate: React.Dispatch<React.SetStateAction<DateTime>>
}

type SessionFormValues = {
    notes: string | null;
    date: Date;
    start: DateTime | null;
    end: DateTime | null;
    impression: string;
};

export const SessionForm = ({ initialSession, dayId, routineId, selectedDate, setSelectedDate }: SessionFormProps) => {

    const formikRef = useRef<FormikProps<SessionFormValues> | null>(null);

    const [t, i18n] = useTranslation();
    const [session, setSession] = React.useState<WorkoutSession | undefined>(initialSession);

    const addSessionQuery = useAddSessionQuery();
    const editSessionQuery = useEditSessionQuery(session?.id || '');
    const findSessionQuery = useFindSessionQuery(
        routineId,
        {
            routine: routineId,
            // eslint-disable-next-line camelcase
            datetime_start__date: dateToYYYYMMDD(selectedDate.toJSDate()),
            day: dayId
        }
    );

    const isLoading = addSessionQuery.isPending || editSessionQuery.isPending || findSessionQuery.isLoading;

    const validationSchema = yup.object({
        notes: yup
            .string()
            .max(NOTES_MAX_LENGTH, t('forms.maxLength', { chars: NOTES_MAX_LENGTH })),
        date: yup
            .date()
            .required(),
        start: yup
            .date()
            .nullable(),
        // An end before the start is not an error, it means the session ran over midnight
        end: yup
            .date()
            .nullable(),
        fitInWeek: yup.boolean()
    });


    useEffect(() => {
        if (!formikRef.current) {
            return;
        }
        if (findSessionQuery.data) {
            formikRef.current.setValues({
                notes: findSessionQuery.data.notes || '',
                impression: findSessionQuery.data.impression || IMPRESSION_NEUTRAL,
                date: findSessionQuery.data.datetimeStart,
                start: DateTime.fromJSDate(findSessionQuery.data.datetimeStart),
                end: findSessionQuery.data.datetimeEnd ? DateTime.fromJSDate(findSessionQuery.data.datetimeEnd) : null,
            });
            setSession(findSessionQuery.data);
        } else if (findSessionQuery.isSuccess && !findSessionQuery.data) {
            formikRef.current.setValues({
                notes: '',
                impression: IMPRESSION_NEUTRAL,
                date: initialSession?.datetimeStart || DateTime.now().toJSDate(), //JS Date, not DateTime
                start: initialSession ? DateTime.fromJSDate(initialSession.datetimeStart) : null,
                end: initialSession?.datetimeEnd ? DateTime.fromJSDate(initialSession.datetimeEnd) : null,
            });
            setSession(undefined);
        }

    }, [findSessionQuery.data, findSessionQuery.isSuccess, initialSession, selectedDate]);


    return (
        <Formik
            enableReinitialize
            initialValues={{
                notes: session !== undefined ? session.notes : '',
                date: session !== undefined ? session.datetimeStart : new Date(),
                start: session !== undefined ? DateTime.fromJSDate(session.datetimeStart) : null,
                end: session?.datetimeEnd != null ? DateTime.fromJSDate(session.datetimeEnd) : null,
                impression: session !== undefined ? session.impression : IMPRESSION_NEUTRAL,
            }}
            innerRef={formikRef}
            validationSchema={validationSchema}
            onSubmit={async (values) => {
                const day = selectedDate.startOf('day');
                const start = values.start
                    ? day.set({ hour: values.start.hour, minute: values.start.minute })
                    : day;
                let end = values.end
                    ? day.set({ hour: values.end.hour, minute: values.end.minute })
                    : null;

                // An end before the start means the session ran past midnight
                if (end !== null && end < start) {
                    end = end.plus({ days: 1 });
                }

                const draft = new WorkoutSession({
                    id: session?.id ?? null,
                    dayId: dayId,
                    routineId: routineId,
                    notes: values.notes,
                    impression: values.impression,
                    datetimeStart: start.toJSDate(),
                    datetimeEnd: end !== null ? end.toJSDate() : null,
                });

                if (session !== undefined) {
                    await editSessionQuery.mutateAsync(draft);
                } else {
                    await addSessionQuery.mutateAsync(draft);
                }
            }}
        >
            {formik => (
                <Form>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <LocalizationProvider dateAdapter={AdapterLuxon} adapterLocale={i18n.language}>
                                <DatePicker
                                    value={selectedDate}
                                    defaultValue={DateTime.now()}
                                    label={t('date')}
                                    onChange={(newValue) => {
                                        if (!newValue) {
                                            return;
                                        }
                                        formik.setFieldValue('date', newValue);
                                        setSelectedDate(newValue);
                                    }}
                                    disableFuture={true}
                                    slotProps={{
                                        textField: {
                                            variant: "standard",
                                            fullWidth: true,
                                            error: formik.touched.date && Boolean(formik.errors.date),
                                            // helperText: formik.touched.date && formik.errors.date
                                        }
                                    }}
                                />
                            </LocalizationProvider>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                            <LocalizationProvider dateAdapter={AdapterLuxon} adapterLocale={i18n.language}>
                                <TimePicker
                                    label={t('start')}
                                    {...formik.getFieldProps('start')}
                                    onChange={(newValue) => {
                                        if (newValue) {
                                            formik.setFieldValue('start', newValue);
                                        }
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
                                <TimePicker
                                    label={t('end')}
                                    {...formik.getFieldProps('end')}
                                    onChange={(newValue) => {
                                        if (newValue) {
                                            formik.setFieldValue('end', newValue);
                                        }
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
                                fieldName="notes"
                                title={t('notes')}
                                fieldProps={{ multiline: true, rows: 4 }}
                            />
                        </Grid>

                        <Grid size={12}>
                            <Typography variant="caption">{t('routines.impression')}</Typography>
                            <ButtonGroup
                                fullWidth
                                color="primary"
                            >
                                <Button
                                    size="small"
                                    color="info"
                                    variant={formik.values.impression === IMPRESSION_BAD ? 'contained' : 'outlined'}
                                    onClick={() => formik.setFieldValue('impression', IMPRESSION_BAD)}
                                >
                                    <SentimentVeryDissatisfied />
                                    {t('routines.impressionBad')}
                                </Button>
                                <Button
                                    size="small"
                                    color="info"
                                    variant={formik.values.impression === IMPRESSION_NEUTRAL ? 'contained' : 'outlined'}
                                    onClick={() => formik.setFieldValue('impression', IMPRESSION_NEUTRAL)}
                                >
                                    <SentimentNeutral />
                                    {t('routines.impressionNeutral')}
                                </Button>
                                <Button
                                    size="small"
                                    color="info"
                                    variant={formik.values.impression === IMPRESSION_GOOD ? 'contained' : 'outlined'}
                                    onClick={() => formik.setFieldValue('impression', IMPRESSION_GOOD)}
                                >
                                    <SentimentSatisfiedAlt />
                                    {t('routines.impressionGood')}
                                </Button>

                            </ButtonGroup>
                        </Grid>
                        <Grid size={12} sx={{ display: "flex", justifyContent: "end" }}>
                            <Button
                                disabled={isLoading}
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
        </Formik>
    );
};
