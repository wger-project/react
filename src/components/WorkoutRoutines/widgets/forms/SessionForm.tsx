import { SentimentNeutral, SentimentSatisfiedAlt, SentimentVeryDissatisfied } from "@mui/icons-material";
import { Button, ButtonGroup, Typography } from "@mui/material";
import Grid from '@mui/material/Grid2';
import { DatePicker, LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import { WgerTextField } from "components/Common/forms/WgerTextField";
import {
    IMPRESSION_BAD,
    IMPRESSION_GOOD,
    IMPRESSION_NEUTRAL,
    NOTES_MAX_LENGTH,
    WorkoutSession
} from "components/WorkoutRoutines/models/WorkoutSession";
import { useAddSessionQuery, useEditSessionQuery, useFindSessionQuery } from "components/WorkoutRoutines/queries";
import { Form, Formik, FormikProps } from "formik";
import { DateTime } from "luxon";
import React, { useEffect } from 'react';
import { useTranslation } from "react-i18next";
import { dateTimeToHHMM, dateToYYYYMMDD } from "utils/date";
import * as yup from 'yup';

interface SessionFormProps {
    initialSession?: WorkoutSession;
    dayId: number,
    routineId: number,
    selectedDate: DateTime,
    setSelectedDate: React.Dispatch<React.SetStateAction<DateTime>>
}

export const SessionForm = ({ initialSession, dayId, routineId, selectedDate, setSelectedDate }: SessionFormProps) => {

    let formik: FormikProps<any> | null;

    const [t, i18n] = useTranslation();
    const [session, setSession] = React.useState<WorkoutSession | undefined>(initialSession);

    // const navigate = useNavigate();
    const addSessionQuery = useAddSessionQuery();
    const editSessionQuery = useEditSessionQuery(session?.id!);
    const findSessionQuery = useFindSessionQuery(
        routineId,
        {
            routine: routineId,
            date: dateToYYYYMMDD(selectedDate.toJSDate()),
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
        end: yup
            .date()
            .nullable()
            .min(
                yup.ref('start'),
                t('forms.endBeforeStart')
            ),
        fitInWeek: yup.boolean()
    });


    useEffect(() => {
        if (findSessionQuery.data) {
            formik!.setValues({
                notes: findSessionQuery.data.notes || '',
                impression: findSessionQuery.data.impression || IMPRESSION_NEUTRAL,
                date: findSessionQuery.data.date,
                start: findSessionQuery.data.timeStart ? DateTime.fromJSDate(findSessionQuery.data.timeStart) : null,
                end: findSessionQuery.data.timeEnd ? DateTime.fromJSDate(findSessionQuery.data.timeEnd) : null,
            });
            setSession(findSessionQuery.data);
        } else if (findSessionQuery.isSuccess && !findSessionQuery.data) {
            formik!.setValues({
                notes: '',
                impression: IMPRESSION_NEUTRAL,
                date: initialSession?.date || DateTime.now().toJSDate(), //JS Date, not DateTime
                start: initialSession?.timeStart ? DateTime.fromJSDate(initialSession.timeStart) : null,
                end: initialSession?.timeEnd ? DateTime.fromJSDate(initialSession.timeEnd) : null,
            });
            setSession(undefined);
        }

    }, [findSessionQuery.data, findSessionQuery.isSuccess, initialSession, selectedDate]);


    return (
        (<Formik
            enableReinitialize
            initialValues={{
                notes: session !== undefined ? session.notes : '',
                date: session !== undefined ? session.date : new Date(),
                start: session !== undefined && session.timeStart !== null ? DateTime.fromJSDate(session.timeStart!) : null,
                end: session !== undefined && session.timeEnd !== null ? DateTime.fromJSDate(session.timeEnd!) : null,
                impression: session !== undefined ? session.impression : IMPRESSION_NEUTRAL,
            }}
            innerRef={ref => formik = ref}
            validationSchema={validationSchema}
            onSubmit={async (values) => {
                const data = {
                    day: dayId,
                    routine: routineId,
                    date: dateToYYYYMMDD(selectedDate.toJSDate()),
                    notes: values.notes!,
                    impression: values.impression,
                    time_start: values.start ? dateTimeToHHMM(values.start.toJSDate()) : null,
                    time_end: values.end ? dateTimeToHHMM(values.end.toJSDate()) : null
                };

                if (session !== undefined) {
                    // @ts-ignore String vs string
                    editSessionQuery.mutateAsync({
                        ...data,
                        id: session.id
                    });
                } else {
                    // @ts-ignore String vs string
                    await addSessionQuery.mutateAsync(data);
                    // navigate(makeLink(WgerLink.ROUTINE_EDIT, i18n.language, { id: routineId }));
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
                        <Grid size={12} display={"flex"} justifyContent={"end"}>
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
        </Formik>)
    );
};
