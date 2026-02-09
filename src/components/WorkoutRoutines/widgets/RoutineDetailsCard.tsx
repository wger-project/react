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
import { RenderLoadingQuery } from "components/Core/Widgets/RenderLoadingQuery";
import { ExerciseImageAvatar } from "components/Exercises/Detail/ExerciseImageAvatar";
import { Language } from "components/Exercises/models/language";
import { useLanguageQuery } from "components/Exercises/queries";
import { getDayName } from "components/WorkoutRoutines/models/Day";
import { RoutineDayData } from "components/WorkoutRoutines/models/RoutineDayData";
import { SetConfigData } from "components/WorkoutRoutines/models/SetConfigData";
import { SlotData } from "components/WorkoutRoutines/models/SlotData";
import { useRoutineDetailQuery } from "components/WorkoutRoutines/queries";
import React from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { getLanguageByShortName } from "services";
import { isSameDay } from "utils/date";
import { makeLink, WgerLink } from "utils/url";


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
                    {routineQuery.data!.dayDataCurrentIterationFiltered.map((dayData, index) =>
                        <DayDetailsCard routineId={routineId} dayData={dayData} key={`dayDetails-${index}`} />
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

    const { i18n } = useTranslation();
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
              alignItems="center"
              justifyContent={"center"}
              sx={{ height: props.rowHeight, marginBottom: props.marginBottom }}>
            <Grid size={12}>
                <Stack spacing={0}>
                    <Typography variant={"h6"}>
                        {props.showExercise ? props.setConfigData.exercise?.getTranslation(language).name : ''}
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
            alignItems="flex-start"
            columnGap={1}
            wrap="nowrap"
        >
            <Grid
                sx={{
                    flex: '0 0 50px',
                }}
            >
                <Stack divider={<Box height="10px" />}>
                    {props.slotData.exercises.map((exercise, index) =>
                        <ExerciseImageAvatar
                            image={exercise.mainImage}
                            iconSize={40}
                            avatarSize={50}
                            key={index}
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
                        key={index}
                        showExercise={showExercise}
                    />;
                })}
            </Grid>
        </Grid>
    );
}


export const DayDetailsCard = (props: { dayData: RoutineDayData, routineId: number, readOnly?: boolean }) => {
    const readOnly = (props.readOnly ?? false) || props.dayData.day === null || props.dayData.day.isRest;

    const theme = useTheme();
    const [t, i18n] = useTranslation();

    const isToday = isSameDay(props.dayData.date, new Date());
    const subheader = <Typography sx={{ whiteSpace: 'pre-line' }}>{props.dayData.day?.description}</Typography>;

    return (
        <Card sx={{ minWidth: 275 }}>
            <CardHeader
                sx={{ bgcolor: theme.palette.grey.A200 }}
                action={props.dayData.day === null || props.dayData.day.isRest || readOnly
                    ? null
                    : <Tooltip title={t('routines.addWeightLog')}>
                        <IconButton
                            href={makeLink(WgerLink.ROUTINE_ADD_LOG, i18n.language, {
                                id: props.routineId,
                                id2: props.dayData.day!.id!
                            })}>
                            <Addchart />
                        </IconButton>
                    </Tooltip>}
                title={<Typography variant={"h5"}>{getDayName(props.dayData.day)}</Typography>}
                avatar={isToday ? <TodayIcon /> : null}
                subheader={subheader}
            />
            {props.dayData.slots.length > 0 && <CardContent sx={{ padding: 0, marginBottom: 0 }}>
                <Stack>
                    {props.dayData.slots.map((slotData, index) => (
                        <div key={index}>
                            <Box padding={1}>
                                <SlotDataList slotData={slotData} />
                            </Box>
                            <Divider />
                        </div>
                    ))}
                </Stack>
            </CardContent>}
        </Card>
    );
};
