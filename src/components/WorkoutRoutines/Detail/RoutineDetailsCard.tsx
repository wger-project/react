import {
    Box,
    Card,
    CardContent,
    CardHeader,
    Chip,
    Container,
    Divider,
    Menu,
    MenuItem,
    Stack,
    Typography
} from "@mui/material";
import Grid from '@mui/material/Grid2';
import { RenderLoadingQuery } from "components/Core/Widgets/RenderLoadingQuery";
import { ExerciseImageAvatar } from "components/Exercises/Detail/ExerciseImageAvatar";
import { useLanguageQuery } from "components/Exercises/queries";
import { RoutineDayData } from "components/WorkoutRoutines/models/RoutineDayData";
import { SetConfigData } from "components/WorkoutRoutines/models/SetConfigData";
import { SlotData } from "components/WorkoutRoutines/models/SlotData";
import { useRoutineDetailQuery } from "components/WorkoutRoutines/queries";
import React from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { getLanguageByShortName } from "services";
import { makeLink, WgerLink } from "utils/url";


export const RoutineDetailsCard = () => {

    const params = useParams<{ routineId: string }>();
    const routineId = params.routineId ? parseInt(params.routineId) : 0;
    const routineQuery = useRoutineDetailQuery(routineId);

    return <Container maxWidth="lg">
        <RenderLoadingQuery
            query={routineQuery}
            child={routineQuery.isSuccess && <>
                {routineQuery.data?.description !== ''
                    && <Typography variant={"caption"} sx={{ whiteSpace: 'pre-line' }}>
                        {routineQuery.data?.description}
                    </Typography>
                }
                <Stack spacing={2} sx={{ mt: 2 }}>
                    {routineQuery.data!.dayDataCurrentIteration.map((dayData) =>
                        <DayDetailsCard dayData={dayData} key={`dayDetails-${dayData.day?.id}`} />
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

    let language = undefined;
    if (languageQuery.isSuccess) {
        language = getLanguageByShortName(
            i18n.language,
            languageQuery.data!
        );
    }

    // @ts-ignore
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


function SlotDataList(props: {
    slotData: SlotData,
    index: number,
}) {
    return (
        <Grid
            container
            justifyContent="space-between"
            alignItems="flex-start"
        >
            <Grid size={1}>
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

            <Grid size={11}>
                {props.slotData.setConfigs.map((setConfig, index) => {
                        // Only show the name of the exercise the first time it appears
                        const showExercise = index === 0 || setConfig.exerciseId !== props.slotData.setConfigs[index - 1]?.exerciseId;
                        return <SetConfigDataDetails
                            setConfigData={setConfig}
                            marginBottom="1em"
                            key={index}
                            showExercise={showExercise}
                        />;
                    }
                )}
            </Grid>
        </Grid>
    );
}

export const DayDetailsCard = (props: { dayData: RoutineDayData }) => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const [t, i18n] = useTranslation();

    const navigateAddLog = () => window.location.href = makeLink(
        WgerLink.ROUTINE_ADD_LOG,
        i18n.language,
        { id: 1 }
    );

    return (
        <Card sx={{ minWidth: 275 }}>
            <CardHeader
                sx={{ bgcolor: "lightgray" }}
                action={props.dayData.day !== null && props.dayData.day.isSpecialType
                    ? <Chip
                        label={props.dayData.day.type}
                        color="info"
                        size="small"
                        sx={{ marginLeft: "0.5em" }} />
                    : null
                }
                title={props.dayData.day === null || props.dayData.day.isRest ? t('routines.restDay') : props.dayData.day.name}
                subheader={props.dayData.day?.description}

            />
            <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{ 'aria-labelledby': 'basic-button' }}
            >
                <MenuItem onClick={navigateAddLog}>
                    {t('routines.addWeightLog')}
                </MenuItem>
            </Menu>
            <CardContent sx={{ padding: 0 }}>
                {props.dayData.slots.length > 0 &&
                    <Stack>
                        {props.dayData.slots.map((slotData, index) => (
                            <div key={`SlotDataList-${props.dayData.day?.id}-${index}`}>
                                <Box padding={1}>
                                    <SlotDataList
                                        slotData={slotData}
                                        index={index}
                                    />
                                </Box>
                                <Divider />
                            </div>
                        ))}
                    </Stack>}
            </CardContent>
        </Card>
    );
};
