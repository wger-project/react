import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { WgerContainerRightSidebar } from "components/Core/Widgets/Container";
import { RenderLoadingQuery } from "components/Core/Widgets/RenderLoadingQuery";
import { MuscleOverview } from "components/Muscles/MuscleOverview";
import { useRoutineDetailQuery } from "components/WorkoutRoutines/queries";
import { RoutineDetailDropdown } from "components/WorkoutRoutines/widgets/RoutineDetailDropdown";
import { DayDetailsCard } from "components/WorkoutRoutines/widgets/RoutineDetailsCard";
import i18n from "i18n";
import React from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { makeLink, WgerLink } from "utils/url";

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
    const subtitle = `${routine?.start.toLocaleDateString()} - ${routine?.end.toLocaleDateString()} (${routine?.durationText})`;
    const chip = routine?.isTemplate
        ? <Chip color="info" size="small" label={t('routines.template')} />
        : null;

    return <RenderLoadingQuery
        query={routineQuery}
        child={routineQuery.isSuccess
            && <WgerContainerRightSidebar
                title={<>{routine!.name} {chip}</>}
                subTitle={subtitle}
                optionsMenu={<RoutineDetailDropdown routine={routineQuery.data!} />}
                mainContent={
                    <Stack spacing={2}>

                        {routine!.description !== ''
                            && <Typography variant={"body2"} sx={{ whiteSpace: 'pre-line' }}>
                                {routine?.description}
                            </Typography>
                        }

                        {routine!.isTemplate && <Button
                            component="a"
                            href={makeLink(WgerLink.ROUTINE_COPY, i18n.language, { id: routineId })}
                            variant={"contained"}
                        >{t('routines.copyAndUseTemplate')}</Button>}

                        {routine!.dayDataCurrentIteration.filter((dayData) => dayData.day !== null).map((dayData, index) =>
                            // {routine!.dayDataCurrentIteration.map((dayData, index) =>
                            <DayDetailsCard routineId={routineId} dayData={dayData} key={index}
                                            readOnly={routine!.isTemplate} />
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