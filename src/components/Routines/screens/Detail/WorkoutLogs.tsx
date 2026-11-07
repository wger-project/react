import BarChartIcon from "@mui/icons-material/BarChart";
import { Button, IconButton, Stack, Tooltip as MuiTooltip, Typography } from "@mui/material";
import { LoadingPlaceholder } from "@/core/ui/LoadingWidget/LoadingWidget";
import { WgerContainerFullWidth } from "@/core/ui/Widgets/Container";
import { Exercise } from "@/components/Exercises";
import { WorkoutLog } from "@/components/Routines/models/WorkoutLog";
import { useRoutineDetailQuery, useRoutineLogData } from "@/components/Routines/queries";
import { ExerciseLog } from "@/components/Routines/widgets/LogWidgets";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { makeLink, WgerLink } from "@/core/lib/url";


export const WorkoutLogs = () => {

    const params = useParams<{ routineId: string }>();
    const routineId = params.routineId ? parseInt(params.routineId) : 0;
    const [t, i18n] = useTranslation();
    const routineLogDataQuery = useRoutineLogData(routineId);
    const routineQuery = useRoutineDetailQuery(routineId);

    if (routineLogDataQuery.isLoading || routineQuery.isLoading) {
        return <LoadingPlaceholder />;
    }

    const error = routineLogDataQuery.error ?? routineQuery.error;
    if (error) {
        return <p>Error: {error.message}</p>;
    }

    // Group by exercise
    let groupedWorkoutLogs: Map<number, WorkoutLog[]> = new Map();

    groupedWorkoutLogs = routineLogDataQuery.data!.reduce((r, routineLogData) => {
        routineLogData.logs.forEach(log => {
            const exerciseId = log.exerciseId;
            r.set(exerciseId, r.get(exerciseId) || []);
            r.get(exerciseId)!.push(log);
        });
        return r;
    }, groupedWorkoutLogs);

    const plannedDays = routineQuery.data!.dayDataCurrentIterationFiltered
        .filter((dayData) => !dayData.day!.isRest);

    // The days above only cover the exercises planned for the current iteration.
    // Logs for anything else, e.g. a swapped exercise or a routine that was
    // imported without days, are collected in their own section so they don't
    // silently disappear. Exercises that could not be loaded are skipped.
    const plannedExerciseIds = new Set(
        plannedDays.flatMap(dayData => dayData.slots.flatMap(slot => slot.exercises.map(exercise => exercise.id)))
    );
    const otherExercises = Array.from(groupedWorkoutLogs.entries())
        .filter(([exerciseId]) => !plannedExerciseIds.has(exerciseId))
        .map(([, logs]) => logs[0].exerciseObj)
        .filter((exercise): exercise is Exercise => exercise !== undefined)
        .sort((a, b) => a.getTranslation().name.localeCompare(b.getTranslation().name));

    return (
        <WgerContainerFullWidth
            title={t("routines.logsHeader")}
            backToUrl={makeLink(WgerLink.ROUTINE_DETAIL, i18n.language, { id: routineId })}
            optionsMenu={
                <MuiTooltip title={t('routines.statsOverview')}>
                    <IconButton
                        component="a"
                        href={makeLink(WgerLink.ROUTINE_STATS_OVERVIEW, i18n.language, { id: routineId })}>
                        <BarChartIcon />
                    </IconButton>
                </MuiTooltip>
            }
        >

            <Typography variant={"body1"}>
                {t('routines.logsFilterNote')}
            </Typography>

            {plannedDays.map((dayData) =>
                <React.Fragment key={dayData.day!.id}>
                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        sx={{ justifyContent: "space-between", alignItems: "center", mt: 4 }}
                    >
                        <Typography variant={"h4"}>
                            {dayData.day!.name}
                        </Typography>
                        <Button
                            component={Link}
                            to={makeLink(
                                WgerLink.ROUTINE_ADD_LOG,
                                i18n.language,
                                { id: routineId, id2: dayData.day!.id! }
                            )}
                            variant="contained"
                        >
                            {t('routines.addLogToDay')}
                        </Button>
                    </Stack>

                    {dayData.slots.map(slot =>
                        slot.exercises.map(exercise =>
                            <ExerciseLog
                                key={exercise.id}
                                routineId={routineId}
                                exercise={exercise}
                                logEntries={groupedWorkoutLogs.get(exercise.id!)!}
                            />)
                    )}
                </React.Fragment>
            )}

            {otherExercises.length > 0 && <>
                <Typography variant={"h4"} sx={{ mt: 4 }}>
                    {t('routines.otherLoggedExercises')}
                </Typography>

                {otherExercises.map(exercise =>
                    <ExerciseLog
                        key={exercise.id}
                        routineId={routineId}
                        exercise={exercise}
                        logEntries={groupedWorkoutLogs.get(exercise.id!)}
                    />
                )}
            </>}

        </WgerContainerFullWidth>
    );
};


