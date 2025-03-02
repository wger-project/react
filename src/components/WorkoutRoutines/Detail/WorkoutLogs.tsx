import BarChartIcon from "@mui/icons-material/BarChart";
import { Button, IconButton, Stack, Tooltip as MuiTooltip, Typography } from "@mui/material";
import { LoadingPlaceholder } from "components/Core/LoadingWidget/LoadingWidget";
import { WgerContainerFullWidth } from "components/Core/Widgets/Container";
import { WorkoutLog } from "components/WorkoutRoutines/models/WorkoutLog";
import { useRoutineDetailQuery, useRoutineLogData } from "components/WorkoutRoutines/queries";
import { ExerciseLog } from "components/WorkoutRoutines/widgets/LogWidgets";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { makeLink, WgerLink } from "utils/url";


export const WorkoutLogs = () => {

    const params = useParams<{ routineId: string }>();
    const routineId = params.routineId ? parseInt(params.routineId) : 0;
    const [t, i18n] = useTranslation();
    const routineLogDataQuery = useRoutineLogData(routineId);
    const routineQuery = useRoutineDetailQuery(routineId);

    if (routineLogDataQuery.isLoading || routineQuery.isLoading) {
        return <LoadingPlaceholder />;
    }

    // Group by exercise
    let groupedWorkoutLogs: Map<number, WorkoutLog[]> = new Map();
    console.log(routineLogDataQuery.data);

    groupedWorkoutLogs = routineLogDataQuery.data!.reduce((r, routineLogData) => {
        routineLogData.logs.forEach(log => {
            const exerciseId = log.exerciseId;
            r.set(exerciseId, r.get(exerciseId) || []);
            r.get(exerciseId)!.push(log);
        });
        return r;
    }, groupedWorkoutLogs);


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
                                exercise={exercise}
                                logEntries={groupedWorkoutLogs.get(exercise.id!)!}
                            />)
                    )}
                </React.Fragment>
            )}

        </WgerContainerFullWidth>
    );
};


