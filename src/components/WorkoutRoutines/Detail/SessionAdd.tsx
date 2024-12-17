import { Stack, Typography } from "@mui/material";
import { WgerContainerRightSidebar } from "components/Core/Widgets/Container";
import { SessionForm } from "components/WorkoutRoutines/widgets/forms/SessionForm";
import { SessionLogsForm } from "components/WorkoutRoutines/widgets/forms/SessionLogsForm";
import { DateTime } from "luxon";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { makeLink, WgerLink } from "utils/url";

export const SessionAdd = () => {
    const params = useParams<{ routineId: string, dayId: string }>();
    const { t, i18n } = useTranslation();
    const [selectedDate, setSelectedDate] = useState<DateTime>(DateTime.now());

    const routineId = parseInt(params.routineId!);
    const dayId = parseInt(params.dayId!);

    return <WgerContainerRightSidebar
        title={t('routines.addWeightLog')}
        backToUrl={makeLink(WgerLink.ROUTINE_DETAIL, i18n.language, { id: routineId })}
        mainContent={
            <Stack>
                <SessionForm
                    routineId={routineId}
                    dayId={dayId}
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                />

                <Typography variant={"h5"}>{t('exercises.exercises')}</Typography>
                <Typography variant={"body2"}>
                    {t('routines.impressionHelpText')}
                </Typography>
                <SessionLogsForm
                    routineId={routineId}
                    dayId={dayId}
                    selectedDate={selectedDate}
                />
            </Stack>
        }
    />;
};