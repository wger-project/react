import React from "react";
import { useParams } from "react-router-dom";
import {
    Card,
    CardActions,
    CardContent,
    CardHeader,
    Container,
    Divider,
    Grid,
    IconButton,
    Menu,
    MenuItem,
    Stack,
    Typography
} from "@mui/material";
import { LoadingPlaceholder } from "components/Core/LoadingWidget/LoadingWidget";
import { useRoutineDetailQuery } from "components/WorkoutRoutines/queries";
import { Day } from "components/WorkoutRoutines/models/Day";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Add, Delete } from "@mui/icons-material";
import { WorkoutSet } from "components/WorkoutRoutines/models/WorkoutSet";
import { WorkoutSetting } from "components/WorkoutRoutines/models/WorkoutSetting";
import { daysOfWeek } from "utils/date";
import { ExerciseImagePlaceholder } from "components/Exercises/Detail/OverviewCard";
import { useTranslation } from "react-i18next";
import { getTranslationKey } from "utils/strings";


export const RoutineDetails = () => {

    const params = useParams<{ routineId: string }>();
    const routineId = params.routineId ? parseInt(params.routineId) : 0;
    const [t] = useTranslation();
    const routineQuery = useRoutineDetailQuery(routineId);

    return (
        <>
            <Container maxWidth="lg">
                {
                    routineQuery.isLoading
                        ? <LoadingPlaceholder />
                        : <>
                            <Typography variant={"h3"}>
                                {routineQuery.data!.name !== '' ? routineQuery.data!.name : t('routines.routine')}
                            </Typography>
                            <Typography variant={"h6"}>
                                {routineQuery.data!.description}
                            </Typography>
                            <Stack spacing={2} sx={{ mt: 2 }}>
                                {routineQuery.data!.days.map((day: Day) => (
                                    <DayDetails day={day} key={day.id} />
                                ))}
                            </Stack>
                        </>
                }
            </Container>
        </>
    );
};

function SettingDetails(props: { setting: WorkoutSetting, set: WorkoutSet }) {

    const [t] = useTranslation();

    const useTranslate = (input: string) => t(getTranslationKey(input));

    // @ts-ignore
    return <Grid container alignItems="center" sx={{ height: "100px" }}>
        <Grid item xs={2} md={1}>
            {props.setting.base?.images.length !== 0
                ? <img
                    src={props.setting.base?.images.length !== 0 ? props.setting.base!.mainImage?.url : "https://images.unsplash.com/photo-1551963831-b3b1ca40c98e?w=242&h=242&fit=crop&auto=format"}
                    width="80%"
                    alt={props.setting.base?.getTranslation().name}
                />
                : <ExerciseImagePlaceholder backgroundColor={"white"} iconColor={"lightgray"} height={100} />
            }
        </Grid>

        <Grid item xs={10}>
            <Stack spacing={0}>
                <Typography variant={"h6"}>
                    {props.setting.base?.getTranslation().name}
                </Typography>
                <Typography>
                    {props.setting.id} - {props.set.getSettingsTextRepresentation(props.setting.base!, useTranslate)}
                </Typography>
            </Stack>
        </Grid>

    </Grid>;
}


function SetList(props: {
    set: WorkoutSet,
    draggableId: number,
    index: number,
}) {

    return <Stack spacing={0}>
        {props.set.settingsFiltered.map((setting) =>
            <SettingDetails
                setting={setting}
                set={props.set}
                key={setting.id}
            />
        )}
        <Divider />
    </Stack>;
}

// Day component that accepts a Day as a prop
const DayDetails = (props: { day: Day }) => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };


    return (
        <Card sx={{ minWidth: 275 }}>
            <CardHeader
                sx={{ bgcolor: "lightgray" }}
                action={
                    <IconButton aria-label="settings" onClick={handleClick}>
                        <MoreVertIcon />
                    </IconButton>
                }
                title={props.day.description}
                subheader={props.day.daysOfWeek.map((dayId) => (daysOfWeek[dayId - 1])).join(", ")}
            />
            <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    'aria-labelledby': 'basic-button',
                }}
            >
                <MenuItem onClick={handleClose}>Add weight log</MenuItem>
                <MenuItem onClick={handleClose}>Edit</MenuItem>
                <Divider />
                <MenuItem onClick={handleClose}>
                    <Delete />
                    Delete
                </MenuItem>
            </Menu>
            <CardContent>

                {props.day.sets.map((set, index) => (
                    <SetList
                        set={set}
                        draggableId={props.day.id}
                        index={index}
                        key={set.id}
                    />
                ))}
            </CardContent>
            <CardActions>
                <IconButton>
                    <Add />
                </IconButton>
            </CardActions>
        </Card>
    );
};
