import { Box, Button, Container, Stack, Typography } from "@mui/material";
import Grid from '@mui/material/Grid2';
import { LoadingPlaceholder } from "components/Core/LoadingWidget/LoadingWidget";
import { DayDetails, DayDragAndDropGrid } from "components/WorkoutRoutines/Detail/DayDetails";
import { RoutineDetailsCard } from "components/WorkoutRoutines/Detail/RoutineDetailsCard";
import { RoutineDetailsTable } from "components/WorkoutRoutines/Detail/RoutineDetailsTable";
import { useRoutineDetailQuery } from "components/WorkoutRoutines/queries";
import { RoutineForm } from "components/WorkoutRoutines/widgets/forms/RoutineForm";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { makeLink, WgerLink } from "utils/url";

export const RoutineEdit = () => {

    const { t, i18n } = useTranslation();

    const params = useParams<{ routineId: string }>();
    const routineId = params.routineId ? parseInt(params.routineId) : 0;
    const routineQuery = useRoutineDetailQuery(routineId);
    const [selectedDay, setSelectedDay] = useState<number | null>(null);

    if (routineQuery.isLoading) {
        return <LoadingPlaceholder />;
    }


    return <>
        <Container maxWidth="lg">
            <Grid container>
                <Grid size={10}>
                    <Typography variant={"h4"}>
                        {t('editName', { name: routineQuery.data?.name })}
                    </Typography>
                </Grid>
                <Grid size={2}>
                    <Button
                        component={Link}
                        variant={"outlined"}
                        size={"small"}
                        to={makeLink(WgerLink.ROUTINE_DETAIL, i18n.language, { id: routineId })}
                    >
                        {t('routines.backToRoutine')}
                    </Button>
                </Grid>


                <Grid size={12}>
                    <RoutineForm routine={routineQuery.data!} />
                </Grid>

                <Grid size={12}>
                    <Box height={20} />
                    <DayDragAndDropGrid
                        routineId={routineId}
                        selectedDay={selectedDay}
                        setSelectedDay={setSelectedDay}
                    />
                </Grid>
                <Grid size={12}>
                    {selectedDay !== null &&
                        <DayDetails
                            day={routineQuery.data!.days.find(day => day.id === selectedDay)!}
                            routineId={routineId}
                        />
                    }
                </Grid>

            </Grid>


            <Stack spacing={2} sx={{ mt: 2 }}>
                <Typography variant={"h4"}>
                    {t('routines.resultingRoutine')}
                </Typography>

                <Box padding={4}>
                    <RoutineDetailsTable />
                    <RoutineDetailsCard />
                </Box>
            </Stack>
        </Container>
    </>;
};


