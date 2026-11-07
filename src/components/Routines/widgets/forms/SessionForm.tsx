import {
    IMPRESSION_BAD,
    IMPRESSION_GOOD,
    IMPRESSION_NEUTRAL,
    NOTES_MAX_LENGTH,
    WorkoutSession
} from "@/components/Routines/models/WorkoutSession";
import { useAddSessionQuery, useEditSessionQuery, useSessionOfDay } from "@/components/Routines/queries";
import { useAppForm } from "@/core/forms/appForm";
import { defaultsKey, fieldError, yupSchema } from "@/core/forms/formUtils";
import { dateLocale } from "@/core/lib/date";
import { FormQueryErrors } from "@/core/ui/Widgets/FormError";
import { Add, SentimentNeutral, SentimentSatisfiedAlt, SentimentVeryDissatisfied } from "@mui/icons-material";
import {
    Button,
    FormLabel,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Stack,
    ToggleButton,
    ToggleButtonGroup,
    Typography
} from "@mui/material";
import Grid from '@mui/material/Grid';
import { DatePicker, LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import { DateTime } from "luxon";
import React, { Ref, useImperativeHandle, useRef } from 'react';
import { useTranslation } from "react-i18next";
import * as yup from 'yup';

interface SessionFormProps {
    dayId: number,
    routineId: number,
    selectedDate: DateTime,
    setSelectedDate: (date: DateTime) => void,
    chosenSessionId: string | null,
    setChosenSessionId: (id: string | null) => void,
    ref?: Ref<SessionFormHandle>,
}

export interface SessionFormHandle {
    /** Validates and saves the session: the id it is stored under, false if it was not saved */
    submit: () => Promise<string | null | false>,
}

interface SessionFormValues {
    notes: string,
    date: Date,
    start: DateTime | null,
    end: DateTime | null,
    impression: string,
}

/* Stands in for the session id while the user is adding one to a day that
 * already has sessions */
const NEW_SESSION = 'new';

/**
 * A day can hold several sessions. One is edited right away, more than one
 * has to be picked apart by the user first, otherwise the form would either
 * edit an arbitrary one or add yet another next to them
 */
export const sessionNeedsChoice = (
    sessions: WorkoutSession[],
    session: WorkoutSession | undefined,
    chosenSessionId: string | null
) => sessions.length > 1 && session === undefined && chosenSessionId !== NEW_SESSION;

export const SessionForm = (
    {
        dayId,
        routineId,
        selectedDate,
        setSelectedDate,
        chosenSessionId,
        setChosenSessionId,
        ref
    }: SessionFormProps) => {

    const { sessions, session, isLoading: isLoadingSessions } = useSessionOfDay(
        routineId,
        dayId,
        selectedDate,
        chosenSessionId
    );

    const needsChoice = sessionNeedsChoice(sessions, session, chosenSessionId);

    // The form freezes its default values, so a session that arrives or changes
    // later gets a fresh form via the key
    return <SessionFormFields
        key={defaultsKey(session?.id)}
        ref={ref}
        dayId={dayId}
        routineId={routineId}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        setChosenSessionId={setChosenSessionId}
        sessions={sessions}
        session={session}
        needsChoice={needsChoice}
        isLoadingSessions={isLoadingSessions}
    />;
};

const SessionFormFields = (
    {
        dayId,
        routineId,
        selectedDate,
        setSelectedDate,
        setChosenSessionId,
        sessions,
        session,
        needsChoice,
        isLoadingSessions,
        ref,
    }: Omit<SessionFormProps, 'chosenSessionId'> & {
        sessions: WorkoutSession[],
        session: WorkoutSession | undefined,
        needsChoice: boolean,
        isLoadingSessions: boolean,
    }) => {

    const [t, i18n] = useTranslation();

    const addSessionQuery = useAddSessionQuery();
    const editSessionQuery = useEditSessionQuery();

    // Where onSubmit stored the session, read by the handle once the submit is through
    const savedId = useRef<string | null | false>(false);

    const validationSchema = yup.object({
        notes: yup
            .string()
            .max(NOTES_MAX_LENGTH, t('forms.maxLength', { count: NOTES_MAX_LENGTH })),
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

    const defaultValues: SessionFormValues = {
        notes: session?.notes ?? '',
        date: session !== undefined ? session.datetimeStart : new Date(),
        start: session !== undefined ? DateTime.fromJSDate(session.datetimeStart) : null,
        end: session?.datetimeEnd != null ? DateTime.fromJSDate(session.datetimeEnd) : null,
        impression: session !== undefined ? session.impression : IMPRESSION_NEUTRAL,
    };

    const form = useAppForm({
        defaultValues,
        validators: { onChange: yupSchema<SessionFormValues>(validationSchema) },
        onSubmit: async ({ value }) => {
            const day = selectedDate.startOf('day');
            const start = value.start
                ? day.set({ hour: value.start.hour, minute: value.start.minute })
                : day;
            let end = value.end
                ? day.set({ hour: value.end.hour, minute: value.end.minute })
                : null;

            // An end before the start means the session ran past midnight
            if (end !== null && end < start) {
                end = end.plus({ days: 1 });
            }

            const draft = new WorkoutSession({
                id: session?.id ?? null,
                dayId: dayId,
                routineId: routineId,
                notes: value.notes,
                impression: value.impression,
                datetimeStart: start.toJSDate(),
                datetimeEnd: end !== null ? end.toJSDate() : null,
            });

            if (session !== undefined) {
                await editSessionQuery.mutateAsync(draft);
                savedId.current = session.id;
            } else {
                // Keep editing what was just added, a second submit would
                // otherwise write another session
                const added = await addSessionQuery.mutateAsync(draft);
                savedId.current = added?.id ?? null;
                setChosenSessionId(added?.id ?? null);
            }
        },
    });

    // The screen has one save button for the session and its logs
    useImperativeHandle(ref, () => ({
        submit: async () => {
            if (needsChoice || isLoadingSessions) {
                return false;
            }
            savedId.current = false;
            try {
                await form.handleSubmit();
            } catch {
                // The mutation's error is shown by FormQueryErrors
                return false;
            }
            return savedId.current;
        }
    }), [form, needsChoice, isLoadingSessions]);


    const impressions = [
        { value: IMPRESSION_BAD, label: t('routines.impressionBad'), icon: <SentimentVeryDissatisfied /> },
        { value: IMPRESSION_NEUTRAL, label: t('routines.impressionNeutral'), icon: <SentimentNeutral /> },
        { value: IMPRESSION_GOOD, label: t('routines.impressionGood'), icon: <SentimentSatisfiedAlt /> },
    ];

    const timeField = (name: 'start' | 'end', label: string) =>
        <LocalizationProvider dateAdapter={AdapterLuxon} adapterLocale={dateLocale(i18n.language)}>
            <form.Field name={name}>
                {field => <TimePicker
                    label={label}
                    name={field.name}
                    value={field.state.value}
                    onChange={(newValue) => {
                        if (newValue) {
                            field.handleChange(newValue);
                        }
                    }}
                    slotProps={{
                        textField: {
                            variant: "standard",
                            fullWidth: true,
                            onBlur: field.handleBlur,
                            error: fieldError(field) !== undefined,
                            helperText: fieldError(field)
                        }
                    }}
                />}
            </form.Field>
        </LocalizationProvider>;

    return (
        // Saved through the handle, Enter in a field must not save the session alone
        <form onSubmit={event => event.preventDefault()}>
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <LocalizationProvider dateAdapter={AdapterLuxon} adapterLocale={dateLocale(i18n.language)}>
                        <form.Field name="date">
                            {field => <DatePicker
                                value={selectedDate}
                                defaultValue={DateTime.now()}
                                label={t('date')}
                                onChange={(newValue) => {
                                    if (!newValue) {
                                        return;
                                    }
                                    field.handleChange(newValue.toJSDate());
                                    setSelectedDate(newValue);
                                }}
                                disableFuture={true}
                                slotProps={{
                                    textField: {
                                        variant: "standard",
                                        fullWidth: true,
                                        error: fieldError(field) !== undefined,
                                    }
                                }}
                            />}
                        </form.Field>
                    </LocalizationProvider>
                    {sessions.length > 1 && !needsChoice &&
                        <Button size="small" sx={{ mt: 1 }} onClick={() => setChosenSessionId(null)}>
                            {t('routines.changeSession')}
                        </Button>}
                </Grid>

                {needsChoice ? <Grid size={12}>
                    <Typography variant={"body1"}>
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
                        {timeField('start', t('start'))}
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                        {timeField('end', t('end'))}
                    </Grid>
                    <Grid size={12}>
                        <form.AppField name="notes">
                            {field => <field.WgerTextField
                                variant="standard"
                                title={t('notes')}
                                fieldProps={{ multiline: true, rows: 4 }}
                            />}
                        </form.AppField>
                    </Grid>
                    <Grid size={12}>
                        <form.Field name="impression">
                            {field => <Stack>
                                <FormLabel id="session-impression" sx={{ typography: 'caption' }}>
                                    {t('routines.impression')}
                                </FormLabel>
                                <ToggleButtonGroup
                                    exclusive
                                    fullWidth
                                    size="small"
                                    color="primary"
                                    aria-labelledby="session-impression"
                                    value={field.state.value}
                                    onChange={(_, value: string | null) => {
                                        // Clicking the active one again would empty it
                                        if (value !== null) {
                                            field.handleChange(value);
                                        }
                                    }}
                                >
                                    {impressions.map(impression =>
                                        <ToggleButton
                                            key={impression.value}
                                            value={impression.value}
                                            sx={{ gap: 1 }}
                                        >
                                            {impression.icon}
                                            {impression.label}
                                        </ToggleButton>
                                    )}
                                </ToggleButtonGroup>
                            </Stack>}
                        </form.Field>
                    </Grid>
                </>}
            </Grid>
            <FormQueryErrors mutationQuery={addSessionQuery} />
            <FormQueryErrors mutationQuery={editSessionQuery} />
        </form>
    );
};
