import { useAppForm } from "@/core/forms/appForm";
import { yupSchema } from "@/core/forms/formUtils";
import { LoadingPlaceholder } from "@/core/ui/LoadingWidget/LoadingWidget";
import {
    Exercise,
    getLanguageByShortName,
    Language,
    NameAutocompleter,
    useLanguageQuery
} from "@/components/Exercises";
import { RIR_VALUES_SELECT } from "@/components/Routines/models/BaseConfig";
import { LogEntryForm } from "@/components/Routines/models/WorkoutLog";
import { useAddRoutineLogsQuery, useRoutineDetailQuery, useSessionOfDay } from "@/components/Routines/queries";
import { REP_UNIT_REPETITIONS, SNACKBAR_AUTO_HIDE_DURATION } from "@/core/lib/consts";
import { SwapHoriz } from "@mui/icons-material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import { Alert, Button, IconButton, InputAdornment, MenuItem, Snackbar, TextField, Typography } from "@mui/material";
import Grid from '@mui/material/Grid';
import { DateTime } from "luxon";
import React, { useRef, useState } from 'react';
import { useTranslation } from "react-i18next";
import * as yup from "yup";

interface SessionLogsFormProps {
    dayId: number,
    routineId: number,
    selectedDate: DateTime,
    chosenSessionId: string | null,
}

interface SessionLogsFormValues {
    logs: LogEntryForm[],
}

export const SessionLogsForm = ({ dayId, routineId, selectedDate, chosenSessionId }: SessionLogsFormProps) => {

    const { t, i18n } = useTranslation();
    const routineQuery = useRoutineDetailQuery(routineId);
    // The session the form above works on, so the logs end up in the one the
    // user has in front of them. Without it the server would sort them into a
    // session by their time, which on a day with several of them is a guess
    const { session } = useSessionOfDay(routineId, dayId, selectedDate, chosenSessionId);
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

    const routine = routineQuery.data!;
    const iterationDayData = routine?.getDayData(dayId, selectedDate.toJSDate()) ?? [];
    const hasNoIterationData = iterationDayData.length === 0;

    // Compute initial values
    const defaultLogs: LogEntryForm[] = [];

    const dayDataList = hasNoIterationData ? routine.dayDataCurrentIteration.filter(dayData => dayData.day?.id === dayId) : iterationDayData;

    for (const dayData of dayDataList) {
        for (const slot of dayData.slots) {
            for (const config of slot.setConfigs) {
                for (let i = 0; i < config.nrOfSets; i++) {

                    defaultLogs.push({
                        clientKey: `${dayData.iteration}-${config.slotEntryId}-${config.exerciseId}-${i}`,
                        exercise: config.exercise!,
                        repetitionsUnit: config.repetitionsUnit!,
                        weightUnit: config.weightUnit!,
                        slotEntry: config.slotEntryId,

                        rir: !hasNoIterationData && config.rir !== null ? config.rir : '',
                        rirTarget: !hasNoIterationData && config.rir !== null ? config.rir : '',
                        repetitions: !hasNoIterationData && config.repetitions !== null ? config.repetitions : '',
                        repetitionsTarget: !hasNoIterationData && config.repetitions !== null ? config.repetitions : '',
                        weight: !hasNoIterationData && config.weight !== null ? config.weight : '',
                        weightTarget: !hasNoIterationData && config.weight !== null ? config.weight : ''
                    });
                }
            }
        }
    }

    return (<>
        {hasNoIterationData &&
            <Alert severity={'info'} sx={{ marginTop: 2 }}>{t('routines.weightLogNotPlanned')}</Alert>
        }

        {/* The form freezes its default values, so a changed plan for the day
          * gets a fresh form via the key */}
        <SessionLogsFields
            key={defaultLogs.map(log => `${log.clientKey}:${log.repetitions}:${log.weight}:${log.rir}`).join('|')}
            dayId={dayId}
            routineId={routineId}
            selectedDate={selectedDate}
            sessionId={session?.id}
            iteration={hasNoIterationData ? null : iterationDayData[0].iteration}
            language={language}
            defaultLogs={defaultLogs}
        />
    </>);
};

const SessionLogsFields = ({ dayId, routineId, selectedDate, sessionId, iteration, language, defaultLogs }: {
    dayId: number,
    routineId: number,
    selectedDate: DateTime,
    sessionId: string | null | undefined,
    iteration: number | null,
    language: Language | undefined,
    defaultLogs: LogEntryForm[],
}) => {

    const { t } = useTranslation();
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const addLogsQuery = useAddRoutineLogsQuery(routineId);
    const handleSnackbarClose = () => setSnackbarOpen(false);
    const [exerciseIdToSwap, setExerciseIdToSwap] = useState<number | null>(null);

    // Counter for the keys of the logs the user adds on top of the planned ones
    const extraLogKey = useRef(0);

    const validationSchema = yup.object({
        logs: yup.array().of(
            yup.object().shape({
                rir: yup.number().nullable(),
                repetitions: yup.number().typeError(t('forms.enterNumber')).nullable(),
                weight: yup.number().typeError(t('forms.enterNumber')).nullable()
            })
        ),
    });

    const handleSubmit = async (values: SessionLogsFormValues) => {
        const data = values.logs
            .filter(l => l.rir !== '' || l.repetitions !== '' || l.weight !== '')
            .map(l => ({
                    date: selectedDate.toISO(),
                    session: sessionId,
                    iteration: iteration,
                    exercise: l.exercise?.id,
                    day: dayId,
                    routine: routineId,
                    // eslint-disable-next-line camelcase
                    slot_entry: l.slotEntry,

                    rir: l.rir !== '' ? l.rir : null,
                    // eslint-disable-next-line camelcase
                    rir_target: l.rirTarget !== '' ? l.rirTarget : null,

                    // eslint-disable-next-line camelcase
                    repetitions_unit: l.repetitionsUnit?.id,
                    repetitions: l.repetitions !== '' ? l.repetitions : null,
                    // eslint-disable-next-line camelcase
                    repetitions_target: l.repetitionsTarget !== '' ? l.repetitionsTarget : null,

                    // eslint-disable-next-line camelcase
                    weight_unit: l.weightUnit?.id,
                    weight: l.weight !== '' ? l.weight : null,
                    // eslint-disable-next-line camelcase
                    weight_target: l.weightTarget !== '' ? l.weightTarget : null,
                }
            ));

        await addLogsQuery.mutateAsync(data);
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
            if (exerciseIdToSwap === log.exercise!.id) {
                // Empty the rest of the values, this is a new exercise not in the routine
                return {
                    ...log,
                    weight: '',
                    weightTarget: '',
                    repetitions: '',
                    repetitionsTarget: '',
                    rir: '',
                    rirTarget: '',
                    exercise: exercise,
                };
            }
            return log;
        });

        form.setFieldValue('logs', updatedLogs);
        setExerciseIdToSwap(null);
    };

    return (<>
        <form onSubmit={e => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
        }}>
            {/* The rows read every value of every log, which an array field does
              * not re-render for: it only follows the array's length */}
            <form.Subscribe selector={state => state.values.logs}>
                {logs => logs.map((log, index) => (
                    <Grid container key={log.clientKey} spacing={1} sx={{ mt: 2 }}>

                        {/* Only show the exercise name the first time it appears */}
                        {(index === 0 || logs[index - 1].exercise!.id !== log.exercise!.id) && <>
                            <Grid size={12}>
                                {exerciseIdToSwap !== log.exercise!.id &&
                                    <Typography variant="h6">
                                        {log.exercise?.getTranslation(language).name}
                                    </Typography>}

                                {exerciseIdToSwap === log.exercise!.id &&
                                    <NameAutocompleter callback={handleCallback} />}

                            </Grid>
                            <Grid size={12}>
                                <Button
                                    type="button"
                                    size="small"
                                    // One more set of the same exercise, prefilled like the one it duplicates
                                    onClick={() => form.insertFieldValue('logs', index, {
                                        ...log,
                                        clientKey: `extra-${extraLogKey.current++}`,
                                    })}
                                >
                                    <AddIcon />
                                    {t('routines.addAdditionalLog')}
                                </Button>
                                <Button
                                    type="button"
                                    size="small"
                                    onClick={() => {
                                        if (exerciseIdToSwap === log.exercise!.id) {
                                            setExerciseIdToSwap(null);
                                        } else {
                                            setExerciseIdToSwap(log.exercise!.id);
                                        }
                                    }}
                                >
                                    <SwapHoriz />
                                    {t('exercises.swapExercise')}
                                </Button>
                                <Button
                                    type="button"
                                    size="small"
                                    onClick={() => form.setFieldValue(
                                        'logs',
                                        logs.filter(l => l.exercise!.id !== log.exercise!.id)
                                    )}
                                >
                                    <DeleteIcon />
                                    {t('delete')}
                                </Button>

                            </Grid>
                        </>}
                        <Grid size={4}>
                            <form.AppField name={`logs[${index}].repetitions`}>
                                {field => <field.WgerTextField
                                    title={t('server.repetitions')}
                                    fieldProps={{
                                        slotProps: {
                                            input: {
                                                endAdornment:
                                                    <InputAdornment position="end">
                                                        {/* Only show reps that are not "repetitions" */}
                                                        {log.repetitionsUnit?.id !== REP_UNIT_REPETITIONS
                                                            ? <Typography variant={'caption'}>
                                                                {log.repetitionsUnit?.name}
                                                            </Typography>
                                                            : null}
                                                    </InputAdornment>
                                            },
                                            htmlInput: {
                                                inputMode: 'decimal'
                                            }
                                        }
                                    }}
                                />}
                            </form.AppField>
                        </Grid>
                        <Grid size={4}>
                            <form.AppField name={`logs[${index}].weight`}>
                                {field => <field.WgerTextField
                                    title={t('weight')}
                                    fieldProps={{
                                        slotProps: {
                                            input: {
                                                endAdornment:
                                                    <InputAdornment position="end">
                                                        <Typography variant={'caption'}>
                                                            {log.weightUnit?.name}
                                                        </Typography>
                                                    </InputAdornment>
                                            },
                                            htmlInput: {
                                                inputMode: 'decimal'
                                            }
                                        }
                                    }}
                                />}
                            </form.AppField>
                        </Grid>

                        <Grid size={3}>
                            <form.Field name={`logs[${index}].rir`}>
                                {field => <TextField
                                    fullWidth
                                    select
                                    label={t('routines.rir')}
                                    variant="standard"
                                    name={field.name}
                                    value={field.state.value}
                                    onChange={event => field.handleChange(event.target.value)}
                                    onBlur={field.handleBlur}
                                >
                                    {RIR_VALUES_SELECT.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </TextField>}
                            </form.Field>
                        </Grid>
                        <Grid size={1}>
                            <IconButton size={"small"} onClick={() => form.removeFieldValue('logs', index)}>
                                <DeleteIcon />
                            </IconButton>
                        </Grid>
                    </Grid>
                ))}
            </form.Subscribe>
            <Grid container spacing={2}>
                <Grid size={12} sx={{ display: "flex", justifyContent: "end" }}>
                    <form.Subscribe selector={state => ({ isValid: state.isValid, isSubmitting: state.isSubmitting })}>
                        {({ isValid, isSubmitting }) => <Button
                            color="primary"
                            disabled={!isValid || isSubmitting || addLogsQuery.isPending}
                            variant="contained"
                            type="submit"
                            sx={{ mt: 2 }}>
                            {t('submit')}
                        </Button>}
                    </form.Subscribe>
                </Grid>
            </Grid>
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
