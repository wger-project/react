import { Stack, Typography } from "@mui/material";
import { WgerContainerRightSidebar } from "components/Core/Widgets/Container";
import { RenderLoadingQuery } from "components/Core/Widgets/RenderLoadingQuery";
import { useRoutineDetailQuery } from "components/WorkoutRoutines/queries";
import { RoutineDetailDropdown } from "components/WorkoutRoutines/widgets/RoutineDetailDropdown";
import { DayDetailsCard } from "components/WorkoutRoutines/widgets/RoutineDetailsCard";
import React from "react";
import { useParams } from "react-router-dom";

export const RoutineDetail = () => {

    const params = useParams<{ routineId: string }>();
    const routineId = params.routineId ? parseInt(params.routineId) : 0;
    const routineQuery = useRoutineDetailQuery(routineId);

    return <RenderLoadingQuery
        query={routineQuery}
        child={routineQuery.isSuccess
            && <WgerContainerRightSidebar
                title={routineQuery.data?.name}
                optionsMenu={<RoutineDetailDropdown routine={routineQuery.data!} />}
                mainContent={
                    <Stack spacing={2} sx={{ mt: 2 }}>
                        {routineQuery.data?.description !== ''
                            && <Typography variant={"body2"} sx={{ whiteSpace: 'pre-line' }}>
                                {routineQuery.data?.description}
                            </Typography>
                        }

                        {routineQuery.data!.dayDataCurrentIteration.filter((dayData) => dayData.day !== null).map((dayData, index) =>
                            <DayDetailsCard dayData={dayData} key={`dayDetails-${index}`} />
                        )}
                    </Stack>
                }
            />}
    />;
};