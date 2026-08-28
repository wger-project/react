import {
    IMPRESSION_BAD,
    IMPRESSION_GOOD,
    IMPRESSION_NEUTRAL,
    NOTES_MAX_LENGTH,
    WorkoutSession
} from "@/components/Routines/models/WorkoutSession";
import { useAddSessionQuery, useEditSessionQuery, useSessionOfDay } from "@/components/Routines/queries";
import { WgerTextField } from "@/core/forms/WgerTextField";
import { FormQueryErrors } from "@/core/ui/Widgets/FormError";
import { Add, SentimentNeutral, SentimentSatisfiedAlt, SentimentVeryDissatisfied } from "@mui/icons-material";
import {
    Button,
    ButtonGroup,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography
} from "@mui/material";
import Grid from '@mui/material/Grid';
import { DatePicker, LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import { Form, Formik } from "formik";
import { DateTime } from "luxon";
import React from 'react';
import { useTranslation } from "react-i18next";
import * as yup from 'yup';

interface SessionFormProps {
    dayId: number,
    routineId: number,
    selectedDate: DateTime,
    setSelectedDate: (date: DateTime) => void,
    chosenSessionId: string | null,
    setChosenSessionId: (id: string | null) => void
}

/* Stands in for the session id while the user is adding one to a day that
 * already has sessions */
const NEW_SESSION = 'new';

export const SessionForm = (
    {
        dayId,
        routineId,
        selectedDate,
        setSelectedDate,
        chosenSessionId,
        setChosenSessionId
    }: SessionFormProps) => {

    const [t, i18n] = useTranslation();

    const addSessionQuery = useAddSessionQuery();
    const editSessionQuery = useEditSessionQuery();
    const { sessions, session, isLoading: isLoadingSessions } = useSessionOfDay(
        routineId,
        dayId,
        selectedDate,
        chosenSessionId
    );

    // A day can hold several sessions. One is edited right away, more than one
    // has to be picked apart by the user first, otherwise the form would either
    // edit an arbitrary one or add yet another next to them
    const needsChoice = sessions.length > 1 && session === undefined && chosenSessionId !== NEW_SESSION;

    const isLoading = addSessionQuery.isPending || editSessionQuery.isPending || isLoadingSessions;

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
                    // Keep editing what was just added, a second submit would
                    // otherwise write another session
                    const added = await addSessionQuery.mutateAsync(draft);
                    setChosenSessionId(added?.id ?? null);
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
                            {sessions.length > 1 && !needsChoice &&
                                <Button size="small" sx={{ mt: 1 }} onClick={() => setChosenSessionId(null)}>
                                    {t('routines.changeSession')}
                                </Button>}
                        </Grid>

                        {needsChoice ? <Grid size={12}>
                            <Typography variant={"body1"} sx={{ mt: 2 }}>
                                {t('routines.multipleSessions')}
                            </Typography>
                            <List>
                                {sessions.map(entry =>
                                    <ListItem key={entry.id} disablePadding>
                                        <ListItemButton onClick={() => setChosenSessionId(entry.id)}>
                                            <ListItemText primary={entry.textRepresentation} />
                                        </ListItemButton>
                                    </ListItem>
                                )}
                                <ListItem disablePadding>
                                    <ListItemButton onClick={() => setChosenSessionId(NEW_SESSION)}>
                                        <ListItemIcon sx={{ minWidth: 36 }}>
                                            <Add />
                                        </ListItemIcon>
                                        <ListItemText primary={t('routines.newSession')} />
                                    </ListItemButton>
                                </ListItem>
                            </List>
                        </Grid> : <>
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
                            <Grid size={12}>
                                <FormQueryErrors mutationQuery={addSessionQuery} />
                                <FormQueryErrors mutationQuery={editSessionQuery} />
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

                        </>}
                    </Grid>
                </Form>
            )}
        </Formik>
    );
};
