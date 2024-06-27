import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
    Box,
    Card,
    CardContent,
    CardHeader,
    Chip,
    Container,
    Grid,
    IconButton,
    Menu,
    MenuItem,
    Stack,
    Typography
} from "@mui/material";
import { LoadingPlaceholder } from "components/Core/LoadingWidget/LoadingWidget";
import { uuid4 } from "components/Core/Misc/uuid";
import { ExerciseImageAvatar } from "components/Exercises/Detail/ExerciseImageAvatar";
import { RoutineDayData } from "components/WorkoutRoutines/models/RoutineDayData";
import { SetConfigData } from "components/WorkoutRoutines/models/SetConfigData";
import { SlotData } from "components/WorkoutRoutines/models/SlotData";
import { useRoutineDetailQuery } from "components/WorkoutRoutines/queries";
import React from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { makeLink, WgerLink } from "utils/url";


export const RoutineDetails = () => {

    const params = useParams<{ routineId: string }>();
    const routineId = params.routineId ? parseInt(params.routineId) : 0;
    const routineQuery = useRoutineDetailQuery(routineId);

    return <>
        <Container maxWidth="lg">
            {routineQuery.isLoading
                ? <LoadingPlaceholder />
                : <>
                    <Typography variant={"caption"}>
                        details -
                        {routineQuery.data?.description}
                    </Typography>
                    <Stack spacing={2} sx={{ mt: 2 }}>
                        {routineQuery.data!.dayDataCurrentIteration.map((day) =>
                            <DayDetails dayData={day} key={uuid4()} />
                        )}
                    </Stack>
                </>
            }
        </Container>
    </>;
};

export function SettingDetails(props: {
    setConfigData: SetConfigData,
    rowHeight?: undefined | string,
    marginBottom?: undefined | string,
}) {

    // @ts-ignore
    return <Grid container
                 alignItems="center"
                 justifyContent={"center"}
                 sx={{ height: props.rowHeight, marginBottom: props.marginBottom }}>
        <Grid item xs={12}>
            <Stack spacing={0}>
                <Typography variant={"subtitle1"}>
                    {props.setConfigData.exercise?.getTranslation().name}
                </Typography>
                <Typography>
                    {props.setConfigData.textRepr}
                    {props.setConfigData.isSpecialType &&
                        <Chip
                            label={props.setConfigData.type}
                            color="primary"
                            size="small"
                            variant="outlined"
                            sx={{ marginLeft: "0.5em" }} />
                    }
                </Typography>
                <Typography variant={"caption"}>
                    {props.setConfigData.comment}
                </Typography>
            </Stack>
        </Grid>
    </Grid>;
}


function SetList(props: {
    slotData: SlotData,
    index: number,
}) {
    return <Grid
        container
        justifyContent="space-between"
        alignItems="flex-start"
    >
        <Grid item xs={1}>
            <Stack divider={<Box height="10px" />}>
                {props.slotData.exercises.map((exercise) =>
                    <ExerciseImageAvatar
                        image={exercise.mainImage}
                        iconSize={50}
                        avatarSize={55}
                        key={uuid4()}
                    />
                )}
            </Stack>
        </Grid>

        <Grid item xs={11}>
            {props.slotData.setConfigs.map((setConfig) =>
                <SettingDetails
                    setConfigData={setConfig}
                    marginBottom="1em"
                    key={uuid4()}
                />
            )}
        </Grid>
    </Grid>;
}

// Day component that accepts a Day as a prop
const DayDetails = (props: { dayData: RoutineDayData }) => {
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
                action={
                    <IconButton aria-label="settings" onClick={handleClick}>
                        <MoreVertIcon />
                    </IconButton>
                }
                title={props.dayData.day.isRest ? t('routines.restDay') : props.dayData.day.name}
                subheader={props.dayData.day.description}
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
            {props.dayData.slots.length > 0 && <CardContent>
                <Stack>
                    {props.dayData.slots.map((slotData, index) => (
                        <SetList
                            slotData={slotData}
                            index={index}
                            key={uuid4()}
                        />
                    ))}
                </Stack>
            </CardContent>}
        </Card>
    );
};
