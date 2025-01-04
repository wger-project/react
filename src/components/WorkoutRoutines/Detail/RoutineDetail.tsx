import { Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
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
    const routineId = params.routineId ? parseInt(params.routineId) : 0;
    const routineQuery = useRoutineDetailQuery(routineId);

    const routine = routineQuery.data;

    const durationDays = routine?.duration.days;
    const durationWeeks = routine?.duration.weeks;

    return <RenderLoadingQuery
        query={routineQuery}
        child={routineQuery.isSuccess
            && <WgerContainerRightSidebar
                title={routine!.name}
                optionsMenu={<RoutineDetailDropdown routine={routineQuery.data!} />}
                mainContent={
                    <Stack spacing={2}>
                        <Typography variant={"subtitle1"}>
                            {routine!.start.toLocaleDateString()} - {routine!.end.toLocaleDateString()} ({routine!.durationText})
                        </Typography>


                        {routine!.description !== ''
                            && <Typography variant={"body2"} sx={{ whiteSpace: 'pre-line' }}>
                                {routine?.description}
                            </Typography>
                        }

                        {routine!.dayDataCurrentIteration.filter((dayData) => dayData.day !== null).map((dayData, index) =>
                            <DayDetailsCard dayData={dayData} key={`dayDetails-${index}`} />
                        )}
                    </Stack>
                }
                sideBar={
                    <Stack>
                        <h3>TODO</h3>
                        <ul>
                            <li>Muscle overview</li>
                        </ul>
                        <Grid container>
                            <Grid size={6}>
                                <MuscleOverview primaryMuscles={[]} secondaryMuscles={[]} isFront={true} />
                            </Grid>
                            <Grid size={6}>
                                <MuscleOverview primaryMuscles={[]} secondaryMuscles={[]} isFront={false} />
                            </Grid>
                        </Grid>
                    </Stack>
                }
            />}
    />;
};