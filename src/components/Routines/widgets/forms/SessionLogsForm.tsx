import {
    Exercise,
    getLanguageByShortName,
    Language,
    NameAutocompleter,
    useLanguageQuery
} from "@/components/Exercises";
import { RIR_VALUES_SELECT } from "@/components/Routines/models/BaseConfig";
import { LogEntryForm } from "@/components/Routines/models/WorkoutLog";
import {
    useAddRoutineLogsQuery,
    useRoutineDetailQuery,
    useRoutineLogQuery,
    useSessionOfDay
} from "@/components/Routines/queries";
import { sessionNeedsChoice } from "@/components/Routines/widgets/forms/SessionForm";
import {
    isFilledIn,
    logsPayload,
    plannedLogs,
    SessionLogsFormValues
} from "@/components/Routines/widgets/forms/sessionLogsFormData";
import { useAppForm } from "@/core/forms/appForm";
import { defaultsKey, submitHandler, yupSchema } from "@/core/forms/formUtils";
import { REP_UNIT_REPETITIONS, SNACKBAR_AUTO_HIDE_DURATION } from "@/core/lib/consts";
import { LoadingPlaceholder } from "@/core/ui/LoadingWidget/LoadingWidget";
import { FormQueryErrors } from "@/core/ui/Widgets/FormError";
import { ChatBubble, ChatBubbleOutlineOutlined, MoreVert, SwapHoriz } from "@mui/icons-material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import {
    Alert,
    Button,
    Box,
    CardActions,
    CardHeader,
    IconButton,
    InputAdornment,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Paper,
    Snackbar,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography
} from "@mui/material";
import { DateTime } from "luxon";
import React, { Fragment, useRef, useState } from 'react';
import { useTranslation } from "react-i18next";
import * as yup from "yup";

interface SessionLogsFormProps {
    dayId: number,
    routineId: number,
    selectedDate: DateTime,
    chosenSessionId: string | null,
    /** Saves the session the logs go into: its id, false if it was not saved */
    saveSession: () => Promise<string | null | false>,
}

export const SessionLogsForm = (
    {
        dayId,
        routineId,
        selectedDate,
        chosenSessionId,
        saveSession
    }: SessionLogsFormProps) => {

    const { t, i18n } = useTranslation();
    const routineQuery = useRoutineDetailQuery(routineId);
    // Until the user picked one of the day's sessions there is nothing to save into
    const { sessions, session } = useSessionOfDay(routineId, dayId, selectedDate, chosenSessionId);
    const needsChoice = sessionNeedsChoice(sessions, session, chosenSessionId);
    const languageQuery = useLanguageQuery();

    let language = undefined;
    if (languageQuery.isSuccess) {
        language = getLanguageByShortName(
            i18n.language,
            languageQuery.data!
        );
    }

    if (routineQuery.isLoading) {
        return <LoadingPlaceholder />;
    }

    const { logs: defaultLogs, iteration } = plannedLogs(routineQuery.data!, dayId, selectedDate.toJSDate());

    return (<>
        {iteration === null &&
            <Alert severity={'info'} sx={{ marginTop: 2 }}>{t('routines.weightLogNotPlanned')}</Alert>
        }

        {/* The form freezes its default values, so a changed plan for the day
          * gets a fresh form via the key */}
        <SessionLogsFields
            key={defaultsKey(defaultLogs.map(log => [log.clientKey, log.repetitions, log.weight, log.rir]))}
            dayId={dayId}
            routineId={routineId}
            selectedDate={selectedDate}
            saveSession={saveSession}
            needsChoice={needsChoice}
            iteration={iteration}
            language={language}
            defaultLogs={defaultLogs}
        />
    </>);
};

const SessionLogsFields = (
    {
        dayId,
        routineId,
        selectedDate,
        saveSession,
        needsChoice,
        iteration,
        language,
        defaultLogs
    }: {
        dayId: number,
        routineId: number,
        selectedDate: DateTime,
        saveSession: () => Promise<string | null | false>,
        needsChoice: boolean,
        iteration: number | null,
        language: Language | undefined,
        defaultLogs: LogEntryForm[],
    }) => {

    const { t } = useTranslation();
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const addLogsQuery = useAddRoutineLogsQuery(routineId);
    const logsQuery = useRoutineLogQuery(routineId);
    const handleSnackbarClose = () => setSnackbarOpen(false);
    const [exerciseIdToSwap, setExerciseIdToSwap] = useState<number | null>(null);
    // The exercise card whose action menu is open
    const [menu, setMenu] = useState<{ anchor: HTMLElement, exerciseId: number } | null>(null);
    // Sets whose note field the user opened; a set with a note always shows it
    const [openNotes, setOpenNotes] = useState<Set<string>>(new Set());
    // Sets already saved for a day: another save must not post them again
    const [saved, setSaved] = useState<{ day: string | null, keys: Set<string> }>({ day: null, keys: new Set() });
    const day = selectedDate.toISODate();
    const savedKeys = saved.day === day ? saved.keys : new Set<string>();

    // Most recent note per exercise from the days before the one being logged
    const lastNoteByExercise = new Map<number, string>();
    if (logsQuery.isSuccess) {
        const dayStart = selectedDate.startOf('day').toJSDate();
        const sorted = [...logsQuery.data].sort((a, b) => b.date.getTime() - a.date.getTime());
        for (const log of sorted) {
            if (log.notes && log.date < dayStart && !lastNoteByExercise.has(log.exerciseId)) {
                lastNoteByExercise.set(log.exerciseId, log.notes);
            }
        }
    }

    // Counter for the keys of the logs the user adds on top of the planned ones
    const extraLogKey = useRef(0);

    const validationSchema = yup.object({
        logs: yup.array().of(
            yup.object().shape({
                rir: yup.number().nullable(),
                repetitions: yup.number().typeError(t('forms.enterNumber')).nullable(),
                weight: yup.number().typeError(t('forms.enterNumber')).nullable(),
                // Sets without values are not saved, so neither would their note
                notes: yup.string().test(
                    'notes-need-values',
                    t('routines.notesNeedValues'),
                    // Empty fields arrive here as undefined, see yupSchema
                    (value, context) => !value
                        || context.parent.repetitions !== undefined
                        || context.parent.weight !== undefined
                        || context.parent.rir !== undefined
                ),
            })
        ),
    });

    const handleSubmit = async (values: SessionLogsFormValues) => {
        // The session first, so the logs end up in the one the user has in front
        // of them. Without its id the server would sort them into a session by
        // their time, which on a day with several of them is a guess
        const sessionId = await saveSession();
        if (sessionId === false) {
            return;
        }

        const toSave = values.logs.filter(log => isFilledIn(log) && !savedKeys.has(log.clientKey));
        const payload = logsPayload(toSave, {
            date: selectedDate,
            sessionId,
            iteration,
            dayId,
            routineId,
        });
        if (payload.length > 0) {
            try {
                await addLogsQuery.mutateAsync(payload);
            } catch {
                // Shown by FormQueryErrors
                return;
            }
            setSaved({ day, keys: new Set([...savedKeys, ...toSave.map(log => log.clientKey)]) });
        }
        setSnackbarOpen(true);
    };

    const form = useAppForm({
        defaultValues: { logs: defaultLogs } as SessionLogsFormValues,
        validators: { onChange: yupSchema<SessionLogsFormValues>(validationSchema) },
        onSubmit: async ({ value }) => handleSubmit(value),
    });

    const handleCallback = (exercise: Exercise | null) => {
        if (exercise === null) {
            return;
        }

        const updatedLogs = form.state.values.logs.map((log) => {
            if (exerciseIdToSwap === log.exercise!.id && !savedKeys.has(log.clientKey)) {
                // Empty the rest of the values, this is a new exercise not in the routine
                return {
                    ...log,
                    weight: '',
                    weightTarget: '',
                    repetitions: '',
                    repetitionsTarget: '',
                    rir: '',
                    rirTarget: '',
                    notes: '',
                    exercise: exercise,
                };
            }
            return log;
        });

        form.setFieldValue('logs', updatedLogs);
        setExerciseIdToSwap(null);
    };

    const toggleNote = (clientKey: string) => setOpenNotes(prev => {
        const next = new Set(prev);
        if (next.has(clientKey)) {
            next.delete(clientKey);
        } else {
            next.add(clientKey);
        }
        return next;
    });

    const numberFieldProps = (adornment: React.ReactNode, label: string, disabled: boolean) => ({
        variant: "standard" as const,
        disabled,
        slotProps: {
            input: {
                endAdornment: <InputAdornment position="end">
                    <Typography variant={'caption'}>{adornment}</Typography>
                </InputAdornment>
            },
            htmlInput: {
                inputMode: 'decimal' as const,
                'aria-label': label,
            }
        }
    });

    return (<>
        <form onSubmit={submitHandler(form)}>
            {/* The rows read every value of every log, which an array field does
              * not re-render for: it only follows the array's length */}
            <form.Subscribe selector={state => state.values.logs}>
                {logs => <Stack spacing={2} sx={{ mt: 2 }}>
                    {groupByExercise(logs).map(group => {
                        const exerciseId = group.exercise.id!;
                        const last = group.entries[group.entries.length - 1];
                        const lastNote = lastNoteByExercise.get(exerciseId);

                        return <Box component="section" key={group.entries[0].log.clientKey}>
                            <CardHeader
                                sx={{ px: 1 }}
                                title={exerciseIdToSwap === exerciseId
                                    ? <NameAutocompleter callback={handleCallback} />
                                    : group.exercise.getTranslation(language).name}
                                subheader={lastNote ? t('routines.lastSession', { note: lastNote }) : undefined}
                                slotProps={{ title: { variant: 'h6' } }}
                                action={<IconButton
                                    aria-label={t('actions')}
                                    onClick={event => setMenu({ anchor: event.currentTarget, exerciseId })}
                                >
                                    <MoreVert />
                                </IconButton>}
                            />
                            <TableContainer>
                                {/* Fixed columns, so the inputs shrink on a phone instead of
                                  * pushing the note and delete buttons out of view */}
                                <Table
                                    size="small"
                                    sx={{
                                        tableLayout: 'fixed',
                                        // No row lines and light underlines, the columns carry the structure
                                        '& .MuiTableCell-root': { px: { xs: 0.5, sm: 1 }, borderBottom: 'none' },
                                        '& .MuiInput-underline:not(.Mui-error):before': { borderBottomColor: 'grey.400' },
                                        '& th': { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
                                    }}
                                >
                                    <TableHead>
                                        <TableRow>
                                            <TableCell align="center" sx={{ width: 32 }}>#</TableCell>
                                            <TableCell>{t('server.repetitions')}</TableCell>
                                            <TableCell>{t('weight')}</TableCell>
                                            <TableCell>{t('routines.rir')}</TableCell>
                                            <TableCell sx={{ width: 72 }}>
                                                <span hidden>{t('actions')}</span>
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {group.entries.map(({ log, index }, setIndex) => {
                                            const setLabel = t('routines.setNr', { number: setIndex + 1 });
                                            const hasNote = log.notes !== '';
                                            const showNote = hasNote || openNotes.has(log.clientKey);
                                            const isSaved = savedKeys.has(log.clientKey);

                                            return <Fragment key={log.clientKey}>
                                                <TableRow>
                                                    <TableCell align="center">
                                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                                            {setIndex + 1}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <form.AppField name={`logs[${index}].repetitions`}>
                                                            {field => <field.WgerTextField
                                                                title=""
                                                                fieldProps={numberFieldProps(
                                                                    // Only show reps that are not "repetitions"
                                                                    log.repetitionsUnit?.id !== REP_UNIT_REPETITIONS
                                                                        ? log.repetitionsUnit?.name
                                                                        : null,
                                                                    `${setLabel}: ${t('server.repetitions')}`,
                                                                    isSaved
                                                                )}
                                                            />}
                                                        </form.AppField>
                                                    </TableCell>
                                                    <TableCell>
                                                        <form.AppField name={`logs[${index}].weight`}>
                                                            {field => <field.WgerTextField
                                                                title=""
                                                                fieldProps={numberFieldProps(
                                                                    log.weightUnit?.name,
                                                                    `${setLabel}: ${t('weight')}`,
                                                                    isSaved
                                                                )}
                                                            />}
                                                        </form.AppField>
                                                    </TableCell>
                                                    <TableCell>
                                                        <form.Field name={`logs[${index}].rir`}>
                                                            {field => <TextField
                                                                fullWidth
                                                                select
                                                                disabled={isSaved}
                                                                variant="standard"
                                                                name={field.name}
                                                                value={field.state.value}
                                                                onChange={event => field.handleChange(event.target.value)}
                                                                onBlur={field.handleBlur}
                                                                slotProps={{
                                                                    select: {
                                                                        SelectDisplayProps: {
                                                                            'aria-label': `${setLabel}: ${t('routines.rir')}`
                                                                        }
                                                                    }
                                                                }}
                                                            >
                                                                {RIR_VALUES_SELECT.map((option) => (
                                                                    <MenuItem key={option.value} value={option.value}>
                                                                        {option.label}
                                                                    </MenuItem>
                                                                ))}
                                                            </TextField>}
                                                        </form.Field>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Stack direction="row">
                                                            <IconButton
                                                                size="small"
                                                                disabled={isSaved}
                                                                aria-label={`${setLabel}: ${t('notes')}`}
                                                                aria-expanded={showNote}
                                                                color={hasNote ? 'primary' : 'default'}
                                                                // A filled note stays open, it would be saved unseen
                                                                onClick={() => !hasNote && toggleNote(log.clientKey)}
                                                            >
                                                                {hasNote ? <ChatBubble /> :
                                                                    <ChatBubbleOutlineOutlined />}
                                                            </IconButton>
                                                            <IconButton
                                                                size="small"
                                                                disabled={isSaved}
                                                                aria-label={`${setLabel}: ${t('delete')}`}
                                                                onClick={() => form.removeFieldValue('logs', index)}
                                                            >
                                                                <DeleteIcon />
                                                            </IconButton>
                                                        </Stack>
                                                    </TableCell>
                                                </TableRow>
                                                {showNote && <TableRow>
                                                    <TableCell />
                                                    <TableCell colSpan={4} sx={{ pt: 0 }}>
                                                        <form.AppField name={`logs[${index}].notes`}>
                                                            {field => <field.WgerTextField
                                                                title=""
                                                                fieldProps={{
                                                                    variant: "standard",
                                                                    multiline: true,
                                                                    disabled: isSaved,
                                                                    placeholder: t('notes'),
                                                                    autoFocus: !hasNote,
                                                                    slotProps: {
                                                                        htmlInput: { 'aria-label': `${setLabel}: ${t('notes')}` }
                                                                    }
                                                                }}
                                                            />}
                                                        </form.AppField>
                                                    </TableCell>
                                                </TableRow>}
                                            </Fragment>;
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <CardActions sx={{ px: 0 }}>
                                <Button
                                    type="button"
                                    size="small"
                                    startIcon={<AddIcon />}
                                    // One more set after the last one, prefilled like it
                                    onClick={() => form.insertFieldValue('logs', last.index + 1, {
                                        ...last.log,
                                        notes: '',
                                        clientKey: `extra-${extraLogKey.current++}`,
                                    })}
                                >
                                    {t('routines.addSet')}
                                </Button>
                            </CardActions>
                        </Box>;
                    })}
                </Stack>}
            </form.Subscribe>

            <Menu
                anchorEl={menu?.anchor}
                open={menu !== null}
                onClose={() => setMenu(null)}
            >
                <MenuItem onClick={() => {
                    setExerciseIdToSwap(exerciseIdToSwap === menu!.exerciseId ? null : menu!.exerciseId);
                    setMenu(null);
                }}>
                    <ListItemIcon><SwapHoriz /></ListItemIcon>
                    <ListItemText>{t('exercises.swapExercise')}</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => {
                    form.setFieldValue(
                        'logs',
                        form.state.values.logs.filter(l => l.exercise!.id !== menu!.exerciseId)
                    );
                    setMenu(null);
                }}>
                    <ListItemIcon><DeleteIcon /></ListItemIcon>
                    <ListItemText>{t('delete')}</ListItemText>
                </MenuItem>
            </Menu>

            <FormQueryErrors mutationQuery={addLogsQuery} />

            {/* Stays in view, so saving doesn't need a scroll to the end of a long day */}
            <Paper
                elevation={3}
                sx={{
                    position: 'sticky',
                    bottom: 0,
                    zIndex: 'appBar',
                    mt: 2,
                    p: 1.5,
                    display: 'flex',
                    justifyContent: 'flex-end',
                }}
            >
                <form.Subscribe selector={state => ({ isValid: state.isValid, isSubmitting: state.isSubmitting })}>
                    {({ isValid, isSubmitting }) => <Button
                        color="primary"
                        disabled={!isValid || isSubmitting || addLogsQuery.isPending || needsChoice}
                        variant="contained"
                        type="submit">
                        {t('save')}
                    </Button>}
                </form.Subscribe>
            </Paper>
        </form>
        <Snackbar
            open={snackbarOpen}
            autoHideDuration={SNACKBAR_AUTO_HIDE_DURATION}
            onClose={handleSnackbarClose}
        >
            <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
                {t('success')}
            </Alert>
        </Snackbar>
    </>);
};

/** Consecutive sets of the same exercise, each with its position in the form's list */
function groupByExercise(logs: LogEntryForm[]) {
    const groups: { exercise: Exercise, entries: { log: LogEntryForm, index: number }[] }[] = [];
    logs.forEach((log, index) => {
        const current = groups[groups.length - 1];
        if (current !== undefined && current.exercise.id === log.exercise!.id) {
            current.entries.push({ log, index });
        } else {
            groups.push({ exercise: log.exercise!, entries: [{ log, index }] });
        }
    });
    return groups;
}
