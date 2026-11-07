import { Stack, Typography } from "@mui/material";
import { WgerContainerRightSidebar } from "@/core/ui/Widgets/Container";
import { SessionForm } from "@/components/Routines/widgets/forms/SessionForm";
import { SessionLogsForm } from "@/components/Routines/widgets/forms/SessionLogsForm";
import { DateTime } from "luxon";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { makeLink, WgerLink } from "@/core/lib/url";

export const SessionAdd = () => {
    const params = useParams<{ routineId: string, dayId: string }>();
    const { t, i18n } = useTranslation();
    const [selectedDate, setSelectedDate] = useState<DateTime>(DateTime.now());
    // Which session of the day the screen works on. Both forms read it: one
    // edits it, the other writes its logs into it. Another date has its own
    // sessions, so the pick doesn't travel along
    const [chosenSessionId, setChosenSessionId] = useState<string | null>(null);

    const selectDate = (date: DateTime) => {
        setSelectedDate(date);
        setChosenSessionId(null);
    };

    const routineId = parseInt(params.routineId ?? '');
    if (Number.isNaN(routineId)) {
        return <p>Please pass an integer as the routine id.</p>;
    }

    const dayId = parseInt(params.dayId ?? '');
    if (Number.isNaN(dayId)) {
        return <p>Please pass an integer as the day id.</p>;
    }

    return <WgerContainerRightSidebar
        title={t('routines.addWeightLog')}
        backToUrl={makeLink(WgerLink.ROUTINE_DETAIL, i18n.language, { id: routineId })}
        mainContent={
            <Stack>
                <SessionForm
                    routineId={routineId}
                    dayId={dayId}
                    selectedDate={selectedDate}
                    setSelectedDate={selectDate}
                    chosenSessionId={chosenSessionId}
                    setChosenSessionId={setChosenSessionId}
                />

                <Typography variant={"h5"}>{t('exercises.exercises')}</Typography>
                <Typography variant={"body2"}>
                    {t('routines.impressionHelpText')}
                </Typography>
                <SessionLogsForm
                    routineId={routineId}
                    dayId={dayId}
                    selectedDate={selectedDate}
                    chosenSessionId={chosenSessionId}
                />
            </Stack>
        }
    />;
};