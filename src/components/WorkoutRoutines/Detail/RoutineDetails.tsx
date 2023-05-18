import React from "react";
import { useParams } from "react-router-dom";
import {
    Box,
    Button,
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
import { makeLink, WgerLink } from "utils/url";


export const RoutineDetails = () => {

    const params = useParams<{ routineId: string }>();
    const routineId = params.routineId ? parseInt(params.routineId) : 0;
    const [t, i18n] = useTranslation();
    const routineQuery = useRoutineDetailQuery(routineId);

    // TODO: remove this when we add the logic in react
    const navigateAddDay = () => window.location.href = makeLink(WgerLink.ROUTINE_ADD_DAY, i18n.language, { id: routineId });

    return (
        <>
            <Container maxWidth="lg">
                {
                    routineQuery.isLoading
                        ? <LoadingPlaceholder />
                        : <>
                            {/*<Typography variant={"h3"}>*/}
                            {/*    {routineQuery.data!.name !== '' ? routineQuery.data!.name : t('routines.routine')}*/}
                            {/*</Typography>*/}
                            <Typography variant={"caption"}>
                                {routineQuery.data?.description}
                            </Typography>
                            <Stack spacing={2} sx={{ mt: 2 }}>
                                {routineQuery.data?.days.map((day) => (
                                    <DayDetails day={day} key={day.id} />
                                ))}
                            </Stack>
                            <Box textAlign="center" sx={{ mt: 4 }}>
                                <Button variant="outlined" onClick={navigateAddDay}>
                                    {t('routines.addDay')}
                                </Button>
                            </Box>

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
            {props.setting.base?.mainImage !== undefined
                ? <img
                    src={props.setting.base?.mainImage.url}
                    width="80%"
                    alt={props.setting.base?.getTranslation().name}
                />
                : <ExerciseImagePlaceholder backgroundColor={"white"} iconColor={"lightgray"} height={100} />
            }
        </Grid>

        {/* ml only needed because in the django app the css breaks a bit */}
        <Grid item xs={10} sx={{ ml: 1 }}>
            <Stack spacing={0}>
                <Typography variant={"h6"}>
                    {props.setting.base?.getTranslation().name}
                </Typography>
                <Typography>
                    {props.setting.id} - {props.set.getSettingsTextRepresentation(props.setting.base!, useTranslate)}
                </Typography>
                <Typography variant={"caption"}>
                    {props.set.comment}
                </Typography>
            </Stack>
        </Grid>

    </Grid>;
}


function SetList(props: {
    set: WorkoutSet,
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

    const [t, i18n] = useTranslation();

    const navigateEditSet = () => window.location.href = makeLink(
        WgerLink.ROUTINE_EDIT_DAY,
        i18n.language,
        { id: props.day.id }
    );
    const navigateAddLog = () => window.location.href = makeLink(
        WgerLink.ROUTINE_ADD_LOG,
        i18n.language,
        { id: props.day.id }
    );

    const navigateDeleteDay = () => window.location.href = makeLink(
        WgerLink.ROUTINE_DELETE_DAY,
        i18n.language,
        { id: props.day.id }
    );

    const navigateAddSet = () => window.location.href = makeLink(
        WgerLink.ROUTINE_ADD_SET,
        i18n.language,
        { id: props.day.id }
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
                title={props.day.description}
                subheader={props.day.daysOfWeek.map((dayId) => (daysOfWeek[dayId - 1])).join(", ")}
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
                <MenuItem onClick={navigateEditSet}>
                    {t('edit')}
                </MenuItem>
                <Divider />
                <MenuItem onClick={navigateDeleteDay}>
                    <Delete />
                    {t('delete')}
                </MenuItem>
            </Menu>
            <CardContent>
                {props.day.sets.map((set, index) => (
                    <SetList
                        set={set}
                        index={index}
                        key={set.id}
                    />
                ))}
            </CardContent>
            <CardActions>
                <IconButton onClick={navigateAddSet}>
                    <Add />
                </IconButton>
            </CardActions>
        </Card>
    );
};
