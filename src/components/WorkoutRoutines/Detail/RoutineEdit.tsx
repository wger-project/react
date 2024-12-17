import { Box, Stack, Typography } from "@mui/material";
import Grid from '@mui/material/Grid2';
import { LoadingPlaceholder } from "components/Core/LoadingWidget/LoadingWidget";
import { WgerContainerFullWidth } from "components/Core/Widgets/Container";
import { RoutineDetailsTable } from "components/WorkoutRoutines/Detail/RoutineDetailsTable";
import { useRoutineDetailQuery } from "components/WorkoutRoutines/queries";
import { DayDetails, DayDragAndDropGrid } from "components/WorkoutRoutines/widgets/DayDetails";
import { RoutineForm } from "components/WorkoutRoutines/widgets/forms/RoutineForm";
import { RoutineDetailsCard } from "components/WorkoutRoutines/widgets/RoutineDetailsCard";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
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


    return <WgerContainerFullWidth
        title={t('editName', { name: routineQuery.data?.name })}
        backToUrl={makeLink(WgerLink.ROUTINE_DETAIL, i18n.language, { id: routineId })}
    >
        <Grid container>
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
                <RoutineDetailsCard />

                <Box height={20} />
                <RoutineDetailsTable />
            </Box>
        </Stack>
    </WgerContainerFullWidth>;
};


