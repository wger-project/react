import { Box, Button, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { WgerContainerRightSidebar } from "components/Core/Widgets/Container";
import { RenderLoadingQuery } from "components/Core/Widgets/RenderLoadingQuery";
import { MuscleOverview } from "components/Muscles/MuscleOverview";
import { useRoutineDetailQuery } from "components/WorkoutRoutines/queries";
import { DayDetailsCard } from "components/WorkoutRoutines/widgets/RoutineDetailsCard";
import React from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { dateToLocale } from "utils/date";
import { makeLink, WgerLink } from "utils/url";

export const TemplateDetail = () => {
    const { t, i18n } = useTranslation();

    const params = useParams<{ routineId: string }>();
    const routineId = parseInt(params.routineId ?? '');
    if (Number.isNaN(routineId)) {
        return <p>Please pass an integer as the routine id.</p>;
    }

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const routineQuery = useRoutineDetailQuery(routineId);

    const routine = routineQuery.data;

    return <RenderLoadingQuery
        query={routineQuery}
        child={routineQuery.isSuccess
            && <WgerContainerRightSidebar
                title={routine?.isPublic ? t('routines.publicTemplate') : t('routines.template')}
                subTitle={routine!.name}
                mainContent={
                    <Stack spacing={2}>
                        <Typography variant={"subtitle1"}>
                            {dateToLocale(routine!.start)} - {dateToLocale(routine!.end)} ({routine!.durationText})
                        </Typography>

                        {routine!.description !== ''
                            && <Typography variant={"body2"} sx={{ whiteSpace: 'pre-line' }}>
                                {routine?.description}
                            </Typography>}

                        <Button
                            component="a"
                            href={makeLink(WgerLink.ROUTINE_COPY, i18n.language, { id: routineId })}
                            variant={"contained"}
                        >{t('routines.copyAndUseTemplate')}</Button>

                        {routine!.dayDataCurrentIterationNoNulls.map((dayData) =>
                            <DayDetailsCard
                                dayData={dayData}
                                routineId={routineId}
                                readOnly={true}
                                key={`dayDetails-${dayData.date.toISOString()}`}
                            />
                        )}
                    </Stack>
                }
                sideBar={
                    <Stack>
                        <Box height={40} />
                        <Grid container>
                            <Grid size={6}>
                                <MuscleOverview
                                    primaryMuscles={routine!.mainMuscles.filter(m => m.isFront)}
                                    secondaryMuscles={routine!.secondaryMuscles.filter(m => m.isFront)}
                                    isFront={true}
                                />
                            </Grid>
                            <Grid size={6}>
                                <MuscleOverview
                                    primaryMuscles={routine!.mainMuscles.filter(m => !m.isFront)}
                                    secondaryMuscles={routine!.secondaryMuscles.filter(m => !m.isFront)}
                                    isFront={false}
                                />
                            </Grid>
                        </Grid>
                    </Stack>
                }
            />}
    />;
};