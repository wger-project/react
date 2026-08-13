import { ExerciseImageAvatar, getLanguageByShortName, Language, useLanguageQuery } from "@/components/Exercises";
import { Day, getDayName } from "@/components/Routines/models/Day";
import { RoutineDayData } from "@/components/Routines/models/RoutineDayData";
import { SetConfigData } from "@/components/Routines/models/SetConfigData";
import { Slot } from "@/components/Routines/models/Slot";
import { SlotData } from "@/components/Routines/models/SlotData";
import { useRoutineDetailQuery } from "@/components/Routines/queries";
import { isSameDay } from "@/core/lib/date";
import { makeLink, WgerLink } from "@/core/lib/url";
import { RenderLoadingQuery } from "@/core/ui/Widgets/RenderLoadingQuery";
import { Addchart } from "@mui/icons-material";
import TodayIcon from '@mui/icons-material/Today';
import {
    Box,
    Card,
    CardContent,
    CardHeader,
    Chip,
    Container,
    Divider,
    IconButton,
    Stack,
    Typography,
    useTheme
} from "@mui/material";
import Grid from '@mui/material/Grid';
import Tooltip from "@mui/material/Tooltip";
import React from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";


export const RoutineDetailsCard = () => {

    const params = useParams<{ routineId: string }>();
    const routineId = parseInt(params.routineId ?? '');
    if (Number.isNaN(routineId)) {
        return <p>Please pass an integer as the routine id.</p>;
    }

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const routineQuery = useRoutineDetailQuery(routineId);

    return <Container maxWidth="lg">
        <RenderLoadingQuery
            query={routineQuery}
            child={routineQuery.isSuccess && <>
                {routineQuery.data?.description !== ''
                    && <Typography variant={"body2"} sx={{ whiteSpace: 'pre-line' }}>
                        {routineQuery.data?.description}
                    </Typography>
                }
                <Stack spacing={2} sx={{ mt: 2 }}>
                    {routineQuery.data!.daysCurrentIteration.map(({ day, dayData }) =>
                        <DayDetailsCard routineId={routineId} day={day} dayData={dayData} key={day.id} />
                    )}
                </Stack>
            </>}
        />
    </Container>;
};


export function SetConfigDataDetails(props: {
    setConfigData: SetConfigData,
    rowHeight?: undefined | string,
    marginBottom?: undefined | string,
    showExercise: boolean,
}) {

    const { t, i18n } = useTranslation();
    const languageQuery = useLanguageQuery();

    let language: Language | undefined = undefined;
    if (languageQuery.isSuccess) {
        language = getLanguageByShortName(
            i18n.language,
            languageQuery.data!
        );
    }

    return (
        <Grid container
              sx={{
                  alignItems: "center",
                  justifyContent: "center",
                  height: props.rowHeight,
                  marginBottom: props.marginBottom
              }}>
            <Grid size={12}>
                <Stack spacing={0}>
                    <Typography variant={"h6"}>
                        {props.showExercise && (props.setConfigData.exercise
                            ? props.setConfigData.exercise.getTranslation(language).name
                            : t('routines.exerciseNotAvailable'))}
                    </Typography>
                    <div>
                        {props.setConfigData.textRepr}
                        {props.setConfigData.isSpecialType &&
                            <Chip
                                label={props.setConfigData.type}
                                color="info"
                                size="small"
                                sx={{ marginLeft: "0.5em" }} />
                        }
                    </div>
                    <Typography variant={"caption"}>
                        {props.setConfigData.comment}
                    </Typography>
                </Stack>
            </Grid>
        </Grid>
    );
}


function SlotDataList(props: { slotData: SlotData }) {
    return (
        <Grid
            container
            sx={{ alignItems: 'flex-start', columnGap: 1, flexWrap: 'nowrap' }}
        >
            <Grid
                sx={{
                    flex: '0 0 50px',
                }}
            >
                <Stack divider={<Box sx={{ height: "10px" }} />}>
                    {props.slotData.exercises.map((exercise) =>
                        <ExerciseImageAvatar
                            image={exercise.mainImage}
                            iconSize={40}
                            avatarSize={50}
                            key={exercise.id}
                        />
                    )}
                </Stack>
            </Grid>

            <Grid
                sx={{ flex: '1 1 auto', minWidth: 0 }}
            >
                {props.slotData.setConfigs.map((setConfig, index) => {
                    const showExercise = index === 0 || setConfig.exerciseId !== props.slotData.setConfigs[index - 1]?.exerciseId;
                    return <SetConfigDataDetails
                        setConfigData={setConfig}
                        marginBottom="1em"
                        key={`set-config-${setConfig.slotEntryId}-${setConfig.exerciseId}`}
                        showExercise={showExercise}
                    />;
                })}
            </Grid>
        </Grid>
    );
}


/*
 * Exercises of a slot as configured, without the values calculated per
 * iteration. Used for days the sequence has no data for.
 */
function SlotEntryList(props: { slot: Slot }) {

    const { t, i18n } = useTranslation();
    const languageQuery = useLanguageQuery();

    let language: Language | undefined = undefined;
    if (languageQuery.isSuccess) {
        language = getLanguageByShortName(
            i18n.language,
            languageQuery.data!
        );
    }

    return (
        <Grid
            container
            sx={{ alignItems: 'flex-start', columnGap: 1, flexWrap: 'nowrap' }}
        >
            <Grid
                sx={{
                    flex: '0 0 50px',
                }}
            >
                <Stack divider={<Box sx={{ height: "10px" }} />}>
                    {props.slot.entries.map((entry) =>
                            entry.exercise && <ExerciseImageAvatar
                                image={entry.exercise.mainImage}
                                iconSize={40}
                                avatarSize={50}
                                key={entry.id}
                            />
                    )}
                </Stack>
            </Grid>

            <Grid
                sx={{ flex: '1 1 auto', minWidth: 0 }}
            >
                {props.slot.entries.map((entry) =>
                    <Typography variant={"h6"} key={entry.id}>
                        {entry.exercise
                            ? entry.exercise.getTranslation(language).name
                            : t('routines.exerciseNotAvailable')}
                    </Typography>
                )}
            </Grid>
        </Grid>
    );
}


export const DayDetailsCard = (props: {
    day: Day,
    dayData: RoutineDayData | null,
    routineId: number,
    readOnly?: boolean
}) => {
    const readOnly = (props.readOnly ?? false) || props.day.isRest;

    const theme = useTheme();
    const [t, i18n] = useTranslation();

    const isToday = props.dayData !== null && isSameDay(props.dayData.date, new Date());
    const subheader = <Typography sx={{ whiteSpace: 'pre-line' }}>{props.day.description}</Typography>;

    const slotData = props.dayData?.slots ?? [];

    return (
        <Card sx={{ minWidth: 275 }}>
            <CardHeader
                sx={{ bgcolor: theme.palette.grey.A200 }}
                action={readOnly
                    ? null
                    : <Tooltip title={t('routines.addWeightLog')}>
                        <IconButton
                            href={makeLink(WgerLink.ROUTINE_ADD_LOG, i18n.language, {
                                id: props.routineId,
                                id2: props.day.id!
                            })}>
                            <Addchart />
                        </IconButton>
                    </Tooltip>}
                title={<Typography variant={"h5"}>{getDayName(props.day)}</Typography>}
                avatar={isToday ? <TodayIcon /> : null}
                subheader={subheader}
            />
            {slotData.length > 0 && <CardContent sx={{ padding: 0, marginBottom: 0 }}>
                <Stack>
                    {slotData.map((slotData, index) => (
                        // The API doesn't expose an id for the slots and they are not reordered here
                        // eslint-disable-next-line @eslint-react/no-array-index-key
                        <div key={index}>
                            <Box sx={{ padding: 1 }}>
                                <SlotDataList slotData={slotData} />
                            </Box>
                            <Divider />
                        </div>
                    ))}
                </Stack>
            </CardContent>}

            {slotData.length === 0 && props.day.slots.length > 0
                && <CardContent sx={{ padding: 0, marginBottom: 0 }}>
                    <Stack>
                        {props.day.slots.map((slot) => (
                            <div key={slot.id}>
                                <Box sx={{ padding: 1 }}>
                                    <SlotEntryList slot={slot} />
                                </Box>
                                <Divider />
                            </div>
                        ))}
                    </Stack>
                </CardContent>}
        </Card>
    );
};
