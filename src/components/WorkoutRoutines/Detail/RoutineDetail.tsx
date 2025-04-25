import { Box, Chip, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { WgerContainerRightSidebar } from "components/Core/Widgets/Container";
import { RenderLoadingQuery } from "components/Core/Widgets/RenderLoadingQuery";
import { MuscleOverview } from "components/Muscles/MuscleOverview";
import { useRoutineDetailQuery } from "components/WorkoutRoutines/queries";
import { RoutineDetailDropdown } from "components/WorkoutRoutines/widgets/RoutineDetailDropdown";
import { DayDetailsCard } from "components/WorkoutRoutines/widgets/RoutineDetailsCard";
import React from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

export const RoutineDetail = () => {
    const { t } = useTranslation();
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
                title={routine!.name}
                subTitle={`${routine!.start.toLocaleDateString()} - ${routine!.end.toLocaleDateString()} (${routine!.durationText})`}
                optionsMenu={<>{routine!.isTemplate &&
                    <Chip label={t('routines.template')} size="small" />}<RoutineDetailDropdown
                    routine={routineQuery.data!} /></>}
                mainContent={
                    <Stack spacing={2}>

                        {routine!.description !== ''
                            && <Typography variant={"body2"} sx={{ whiteSpace: 'pre-line' }}>
                                {routine?.description}
                            </Typography>
                        }

                        {routine!.dayDataCurrentIteration.filter((dayData) => dayData.day !== null).map((dayData, index) =>
                            // {routine!.dayDataCurrentIteration.map((dayData, index) =>
                            <DayDetailsCard routineId={routineId} dayData={dayData} key={index} />
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