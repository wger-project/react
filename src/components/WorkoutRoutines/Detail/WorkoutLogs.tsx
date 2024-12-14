import { Button, Container, Stack, Typography } from "@mui/material";
import { LoadingPlaceholder } from "components/Core/LoadingWidget/LoadingWidget";
import { WorkoutLog } from "components/WorkoutRoutines/models/WorkoutLog";
import { useRoutineDetailQuery, useRoutineLogQuery } from "components/WorkoutRoutines/queries";
import { ExerciseLog } from "components/WorkoutRoutines/widgets/LogWidgets";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { REP_UNIT_REPETITIONS, WEIGHT_UNIT_KG, WEIGHT_UNIT_LB } from "utils/consts";
import { makeLink, WgerLink } from "utils/url";


export const WorkoutLogs = () => {

    const params = useParams<{ routineId: string }>();
    const routineId = params.routineId ? parseInt(params.routineId) : 0;
    const [t, i18n] = useTranslation();
    const logsQuery = useRoutineLogQuery(routineId, false);
    const routineQuery = useRoutineDetailQuery(routineId);

    // Group by exercise
    let groupedWorkoutLogs: Map<number, WorkoutLog[]> = new Map();
    if (logsQuery.isSuccess) {
        groupedWorkoutLogs = logsQuery.data!.reduce(function (r, log) {
            r.set(log.exerciseId, r.get(log.exerciseId) || []);

            // Only add logs with weight unit and repetition unit
            // This should be done server side over the API, but we can't filter everything yet
            if ([WEIGHT_UNIT_KG, WEIGHT_UNIT_LB].includes(log.weightUnitId) && log.repetitionUnitId === REP_UNIT_REPETITIONS) {
                r.get(log.exerciseId)!.push(log);
            }

            return r;
        }, new Map());
    }

    if (logsQuery.isLoading || routineQuery.isLoading) {
        return <LoadingPlaceholder />;
    }

    return (
        <>
            <Container maxWidth="lg">
                <Typography variant={"h4"}>
                    {t("routines.logsHeader")}
                </Typography>
                {/*<Typography variant={"body2"}>*/}
                {/*    This page shows the training logs belonging to this workout only.*/}
                {/*</Typography>*/}
                {/*<Typography variant={"body2"}>*/}
                {/*    If on a single day there is more than one entry with the same number of repetitions, but different*/}
                {/*    weights, only the entry with the higher weight is shown in the diagram.*/}
                {/*</Typography>*/}
                <Typography variant={"body1"}>
                    {t('routines.logsFilterNote')}
                </Typography>

                {routineQuery.data!.dayDataCurrentIteration.filter((dayData) => dayData.day !== null && !dayData.day.isRest).map((dayData, index) =>
                    <React.Fragment key={index}>
                        <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            justifyContent="space-between"
                            alignItems="center"
                            sx={{ mt: 4 }}
                        >
                            <Typography variant={"h4"}>
                                {dayData.day!.name}
                            </Typography>
                            <Button
                                component={Link}
                                to={makeLink(WgerLink.ROUTINE_ADD_LOG, i18n.language, {
                                    id: routineId,
                                    id2: dayData.day!.id!
                                })}
                                variant="contained"
                            >
                                {t('routines.addLogToDay')}
                            </Button>
                        </Stack>

                        {dayData.slots.map(slot =>
                            slot.exercises.map(exercise =>
                                <ExerciseLog
                                    key={exercise.id}
                                    exercise={exercise}
                                    logEntries={groupedWorkoutLogs.get(exercise.id!)!}
                                />)
                        )}
                    </React.Fragment>
                )}

            </Container>
        </>
    );
};


