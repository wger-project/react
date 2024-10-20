import { Box, Container, FormControlLabel, Stack, Switch, Typography } from "@mui/material";
import { LoadingPlaceholder } from "components/Core/LoadingWidget/LoadingWidget";
import { DayDetails, DayDragAndDropGrid } from "components/WorkoutRoutines/Detail/DayDetails";
import { RoutineDetailsCard } from "components/WorkoutRoutines/Detail/RoutineDetailsCard";
import { RoutineDetailsTable } from "components/WorkoutRoutines/Detail/RoutineDetailsTable";
import { useRoutineDetailQuery } from "components/WorkoutRoutines/queries";
import { RoutineForm } from "components/WorkoutRoutines/widgets/forms/RoutineForm";
import React from "react";
import { useParams } from "react-router-dom";

export const RoutineEdit = () => {

    /*
    TODO:
        * Add drag and drop (https://github.com/hello-pangea/dnd) for
          - ✅ the days
          - the slots? does this make sense?
          - the exercises within the slots?
        * advanced / simple mode: the simple mode only shows weight and reps
          while the advanced mode allows to edit all the other stuff
        * RiRs in dropdown (0, 0.5, 1, 1.5, 2,...)
        * rep and weight units in dropdown
        * for dynamic config changes, +/-, replace toggle, needs_logs_to_appy toggle
        * add / remove / edit slots
        * add / remove / edit days
        * add / remove / edit exercises
        * add / remove / edit sets
        * tests!
        * ...
     */

    const params = useParams<{ routineId: string }>();
    const routineId = params.routineId ? parseInt(params.routineId) : 0;
    const routineQuery = useRoutineDetailQuery(routineId);
    const [selectedDay, setSelectedDay] = React.useState<number | null>(null);
    const [simpleMode, setSimpleMode] = React.useState(true);

    if (routineQuery.isLoading) {
        return <LoadingPlaceholder />;
    }


    return <>
        <Container maxWidth="lg">
            <Typography variant={"h4"}>
                Edit {routineQuery.data?.name}
            </Typography>

            <FormControlLabel
                control={<Switch checked={simpleMode} onChange={() => setSimpleMode(!simpleMode)} />}
                label="Simple mode" />

            <RoutineForm routine={routineQuery.data!} firstDayId={1000} />

            <DayDragAndDropGrid
                routineId={routineId}
                selectedDay={selectedDay}
                setSelectedDay={setSelectedDay}
            />

            {selectedDay !== null &&
                <DayDetails
                    day={routineQuery.data!.days.find(day => day.id === selectedDay)!}
                    routineId={routineId}
                    simpleMode={simpleMode}
                />
            }

            <Stack spacing={2} sx={{ mt: 2 }}>
                <Typography variant={"h4"}>
                    Resulting routine
                </Typography>

                <Box padding={4}>
                    <RoutineDetailsTable />
                    <RoutineDetailsCard />
                </Box>
            </Stack>
        </Container>
    </>;
};


