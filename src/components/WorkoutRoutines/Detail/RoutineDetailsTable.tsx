import { Container, Stack } from "@mui/material";
import { WgerContainerFullWidth } from "components/Core/Widgets/Container";
import { RenderLoadingQuery } from "components/Core/Widgets/RenderLoadingQuery";
import { Routine } from "components/WorkoutRoutines/models/Routine";
import { useRoutineDetailQuery } from "components/WorkoutRoutines/queries";
import { DayTable, DayTableExercises } from "components/WorkoutRoutines/widgets/RoutineTable";
import React from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { makeLink, WgerLink } from "utils/url";


export const RoutineDetailsTable = () => {
    const { i18n } = useTranslation();
    const params = useParams<{ routineId: string }>();
    const routineId = params.routineId ? parseInt(params.routineId) : 0;
    const routineQuery = useRoutineDetailQuery(routineId);

    return <RenderLoadingQuery
        query={routineQuery}
        child={routineQuery.isSuccess
            && <WgerContainerFullWidth
                title={routineQuery.data!.name}
                backToUrl={makeLink(WgerLink.ROUTINE_DETAIL, i18n.language, { id: routineId })}
            >
                <RoutineTable routine={routineQuery.data!} />
            </WgerContainerFullWidth>
        } />;
};


export const RoutineTable = (props: { routine: Routine }) => {

    return <Container maxWidth={false} sx={{ overflowX: 'scroll', display: 'flex', }}>
        <Stack direction={'row'}>
            <DayTableExercises
                dayData={props.routine.groupedDayDataByIteration[1] !== undefined ? props.routine.groupedDayDataByIteration[1] : []}
                iteration={1}
            />
            {Object.keys(props.routine.groupedDayDataByIteration).map((iteration) =>
                <DayTable
                    dayData={props.routine.groupedDayDataByIteration[parseInt(iteration)]}
                    iteration={parseInt(iteration)}
                    cycleLength={props.routine.cycleLength}
                    key={iteration}
                />
            )}
        </Stack>
    </Container>;
};


