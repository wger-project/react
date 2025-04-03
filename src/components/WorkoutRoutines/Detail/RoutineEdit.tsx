import { Box, Divider, Stack, Typography, useTheme } from "@mui/material";
import Grid from '@mui/material/Grid2';
import { LoadingPlaceholder } from "components/Core/LoadingWidget/LoadingWidget";
import { WgerContainerFullWidth } from "components/Core/Widgets/Container";
import { useProfileQuery } from "components/User/queries/profile";
import { RoutineTable } from "components/WorkoutRoutines/Detail/RoutineDetailsTable";
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
    const theme = useTheme();

    const profileQuery = useProfileQuery();
    const params = useParams<{ routineId: string }>();
    const routineId = params.routineId ? parseInt(params.routineId) : 0;
    const routineQuery = useRoutineDetailQuery(routineId);
    const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);

    if (routineQuery.isLoading || profileQuery.isLoading) {
        return <LoadingPlaceholder />;
    }

    if (routineQuery.isError) {
        return <p>Error: {routineQuery.error.message}</p>;
    }

    if (selectedDayIndex === null && routineQuery.data!.days.length > 0) {
        setSelectedDayIndex(0);
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
                    selectedDayIndex={selectedDayIndex}
                    setSelectedDayIndex={setSelectedDayIndex}
                />
            </Grid>
            {selectedDayIndex !== null && <>
                <Grid size={12} sx={{ backgroundColor: theme.palette.grey[100], padding: 1 }}>
                    <Box>
                        <DayDetails
                            day={routineQuery.data!.days[selectedDayIndex]}
                            routineId={routineId}
                            setSelectedDayIndex={setSelectedDayIndex}
                        />
                    </Box>
                </Grid>
            </>}
        </Grid>


        {routineQuery.data!.days.length > 0 && <Stack spacing={2} sx={{ mt: 2 }}>
            <Box height={40} />
            <Typography variant={"h4"}>
                {t('routines.resultingRoutine')}
            </Typography>
            <Divider />

            <Box>
                <RoutineDetailsCard />
                <Box height={20} />
                <RoutineTable routine={routineQuery.data!} />
            </Box>
        </Stack>}
    </WgerContainerFullWidth>;
};


