import { SwapHoriz } from "@mui/icons-material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import { Alert, Button, IconButton, InputAdornment, MenuItem, Snackbar, TextField, Typography } from "@mui/material";
import Grid from '@mui/material/Grid2';
import { WgerTextField } from "components/Common/forms/WgerTextField";
import { LoadingPlaceholder } from "components/Core/LoadingWidget/LoadingWidget";
import { NameAutocompleter } from "components/Exercises/Filter/NameAutcompleter";
import { useLanguageQuery } from "components/Exercises/queries";
import { RIR_VALUES_SELECT } from "components/WorkoutRoutines/models/BaseConfig";
import { LogEntry } from "components/WorkoutRoutines/models/WorkoutLog";
import { useAddRoutineLogsQuery, useRoutineDetailQuery } from "components/WorkoutRoutines/queries";
import { FieldArray, Form, Formik, FormikProps } from "formik";
import { DateTime } from "luxon";
import React, { useState } from 'react';
import { useTranslation } from "react-i18next";
import { getLanguageByShortName } from "services";
import { ExerciseSearchResponse } from "services/responseType";
import { REP_UNIT_REPETITIONS, SNACKBAR_AUTO_HIDE_DURATION } from "utils/consts";
import * as yup from "yup";

interface SessionLogsFormProps {
    dayId: number,
    routineId: number,
    selectedDate: DateTime,
}

export const SessionLogsForm = ({ dayId, routineId, selectedDate }: SessionLogsFormProps) => {

    const { t, i18n } = useTranslation();
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const routineQuery = useRoutineDetailQuery(routineId);
    const addLogsQuery = useAddRoutineLogsQuery(routineId);
    const languageQuery = useLanguageQuery();

    let language = undefined;
    if (languageQuery.isSuccess) {
        language = getLanguageByShortName(
            i18n.language,
            languageQuery.data!
        );
    }

    const handleSnackbarClose = () => {  // For MUI Snackbar
        setSnackbarOpen(false);
    };

    const [exerciseIdToSwap, setExerciseIdToSwap] = useState<number | null>(null);

    if (routineQuery.isLoading) {
        return <LoadingPlaceholder />;
    }

    const routine = routineQuery.data!;

    const validationSchema = yup.object({
        logs: yup.array().of(
            yup.object().shape({
                rir: yup.number().nullable(),
                reps: yup.number().typeError(t('forms.enterNumber')).nullable(),
                weight: yup.number().typeError(t('forms.enterNumber')).nullable()
            })
        ),
    });

    const handleSubmit = async (values: { logs: LogEntry[] }) => {
        const data = values.logs
            .filter(l => l.rir !== '' && l.reps !== '' && l.weight !== '')
            .map(l => ({
                    date: selectedDate.toISO(),
                    rir: l.rir,
                    reps: l.reps,
                    weight: l.weight,
                    exercise: l.exercise?.id,
                    day: dayId,
                    routine: routineId,
                }
            ));
        await addLogsQuery.mutateAsync(data);
        setSnackbarOpen(true);
    };

    const handleCallback = async (exerciseResponse: ExerciseSearchResponse | null, formik: FormikProps<{
        logs: LogEntry[]
    }>) => {

        if (exerciseResponse === null) {
            return;
        }

        const updatedLogs = formik.values.logs.map((log) => {
            if (exerciseIdToSwap === log.exercise!.id) {
                // Empty the rest of the values, this is a new exercise not in the routine
                return {
                    ...log,
                    weight: '',
                    reps: '',
                    rir: '',
                    exercise: exerciseResponse.exercise!,
                };
            }
            return log;
        });

        await formik.setValues({
            ...formik.values,
            logs: updatedLogs
        });

        setExerciseIdToSwap(null);

    };

    // Compute initial values
    const initialValues = { logs: [] as LogEntry[] };
    for (const dayData of routine.dayDataCurrentIteration.filter(dayData => dayData.day!.id === dayId)) {
        for (const slot of dayData.slots) {
            for (const config of slot.setConfigs) {
                for (let i = 0; i < config.nrOfSets; i++) {

                    initialValues.logs.push({
                        exercise: config.exercise!,
                        repsUnit: config.repsUnit!,
                        weightUnit: config.weightUnit!,

                        rir: config.rir !== null ? config.rir : '',
                        reps: config.reps !== null ? config.reps : '',
                        weight: config.weight !== null ? config.weight : ''
                    });
                }
            }
        }
    }

    return (<>
        <Formik
            enableReinitialize
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
        >
            {formik => (
                <Form>
                    <FieldArray name={"logs"}>
                        {({ insert, remove, push }) => (<>

                                {formik.values.logs.map((log, index) => (
                                    <Grid container key={index} spacing={1} sx={{ mt: 2 }}>

                                        {/* Only show the exercise name the first time it appears */}
                                        {(index === 0 || (index > 0 && formik.values.logs[index - 1].exercise!.id != formik.values.logs[index].exercise!.id)) && <>
                                            <Grid size={12}>
                                                {exerciseIdToSwap !== formik.values.logs[index].exercise!.id &&
                                                    <Typography variant="h6">
                                                        {formik.values.logs[index].exercise?.getTranslation(language).name}
                                                    </Typography>}

                                                {exerciseIdToSwap === formik.values.logs[index].exercise!.id &&
                                                    <NameAutocompleter
                                                        loadExercise={true}
                                                        callback={(searchResponse) => handleCallback(searchResponse, formik)}
                                                    />}

                                            </Grid>
                                            <Grid size={12}>
                                                <Button
                                                    type="button"
                                                    size="small"
                                                    onClick={() => insert(index, {
                                                        exercise: formik.values.logs[index].exercise,
                                                        reps: formik.values.logs[index].reps,
                                                        weight: formik.values.logs[index].weight
                                                    })}
                                                >
                                                    <AddIcon />
                                                    {t('routines.addAdditionalLog')}
                                                </Button>
                                                <Button
                                                    type="button"
                                                    size="small"
                                                    onClick={() => {
                                                        if (exerciseIdToSwap === formik.values.logs[index].exercise!.id) {
                                                            setExerciseIdToSwap(null);
                                                        } else {
                                                            setExerciseIdToSwap(formik.values.logs[index].exercise!.id);
                                                        }
                                                    }}
                                                >
                                                    <SwapHoriz />
                                                    {t('exercises.swapExercise')}
                                                </Button>
                                                <Button
                                                    type="button"
                                                    size="small"
                                                    onClick={async () => await formik.setValues({
                                                        ...formik.values,
                                                        logs: formik.values.logs.filter(l => l.exercise!.id !== formik.values.logs[index].exercise!.id)
                                                    })}
                                                >
                                                    <DeleteIcon />
                                                    {t('delete')}
                                                </Button>

                                            </Grid>
                                        </>}
                                        <Grid size={4}>
                                            <WgerTextField
                                                fieldName={`logs.${index}.reps`}
                                                title={t('routines.reps')}
                                                fieldProps={{
                                                    slotProps: {
                                                        input: {
                                                            endAdornment:
                                                                <InputAdornment position="end">
                                                                    {/* Only show reps that are not "repetitions" */}
                                                                    {formik.values.logs[index].repsUnit?.id !== REP_UNIT_REPETITIONS
                                                                        ? <Typography variant={'caption'}>
                                                                            {formik.values.logs[index].repsUnit?.name}
                                                                        </Typography>
                                                                        : null}
                                                                </InputAdornment>

                                                        }
                                                    }
                                                }}
                                            />
                                        </Grid>
                                        <Grid size={4}>
                                            <WgerTextField
                                                fieldName={`logs.${index}.weight`}
                                                title={t('weight')}
                                                fieldProps={{
                                                    slotProps: {
                                                        input: {
                                                            endAdornment:
                                                                <InputAdornment position="end">
                                                                    <Typography variant={'caption'}>
                                                                        {formik.values.logs[index].weightUnit?.name}
                                                                    </Typography>
                                                                </InputAdornment>
                                                        }
                                                    }
                                                }}
                                            />
                                        </Grid>

                                        <Grid size={3}>
                                            <TextField
                                                fullWidth
                                                select
                                                label={t('routines.rir')}
                                                variant="standard"
                                                {...formik.getFieldProps(`logs.${index}.rir`)}
                                            >
                                                {RIR_VALUES_SELECT.map((option) => (
                                                    <MenuItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </MenuItem>
                                                ))}
                                            </TextField>
                                        </Grid>
                                        <Grid size={1}>
                                            <IconButton size={"small"} onClick={() => remove(index)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </Grid>
                                    </Grid>
                                ))}
                            </>
                        )}
                    </FieldArray>
                    <Grid container spacing={2}>
                        <Grid size={12} display={"flex"} justifyContent={"end"}>
                            <Button
                                color="primary"
                                // disabled={!formik.isValid || formik.isSubmitting || !formik.dirty}
                                disabled={!formik.isValid || formik.isSubmitting || addLogsQuery.isPending}
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
