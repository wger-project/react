import { Stack, Typography } from "@mui/material";
import { WgerContainerRightSidebar } from "components/Core/Widgets/Container";
import { RenderLoadingQuery } from "components/Core/Widgets/RenderLoadingQuery";
import { RoutineDetailDropdown } from "components/WorkoutRoutines/Detail/RoutineDetailDropdown";
import { DayDetailsCard } from "components/WorkoutRoutines/Detail/RoutineDetailsCard";
import { useRoutineDetailQuery } from "components/WorkoutRoutines/queries";
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
                            && <Typography variant={"caption"} sx={{ whiteSpace: 'pre-line' }}>
                                {routineQuery.data?.description}
                            </Typography>
                        }

                        {routineQuery.data!.dayDataCurrentIteration.map((dayData, index) =>
                            <DayDetailsCard dayData={dayData} key={`dayDetails-${index}`} />
                        )}
                    </Stack>
                }
            />}
    />;
};