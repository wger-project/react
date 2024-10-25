import { Add, Delete } from "@mui/icons-material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    CardHeader,
    Container,
    Divider,
    IconButton,
    Menu,
    MenuItem,
    Stack,
    Typography
} from "@mui/material";
import Grid from '@mui/material/Grid2';
import { LoadingPlaceholder } from "components/Core/LoadingWidget/LoadingWidget";
import { ExerciseImageAvatar } from "components/Exercises/Detail/ExerciseImageAvatar";
import { Day } from "components/WorkoutRoutines/models/Day";
import { WorkoutSet } from "components/WorkoutRoutines/models/WorkoutSet";
import { WorkoutSetting } from "components/WorkoutRoutines/models/WorkoutSetting";
import { useRoutineDetailQuery } from "components/WorkoutRoutines/queries";
import React from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { daysOfWeek } from "utils/date";
import { makeLink, WgerLink } from "utils/url";


export const RoutineDetails = () => {

    const params = useParams<{ routineId: string }>();
    const routineId = params.routineId ? parseInt(params.routineId) : 0;
    const [t, i18n] = useTranslation();
    const routineQuery = useRoutineDetailQuery(routineId);

    // TODO: remove this when we add the logic in react
    const navigateAddDay = () => window.location.href = makeLink(WgerLink.ROUTINE_ADD_DAY, i18n.language, { id: routineId });

    return <>
        <Container maxWidth="lg">
            {routineQuery.isLoading
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
    </>;
};

export function SettingDetails(props: {
    setting: WorkoutSetting,
    set: WorkoutSet,
    imageHeight?: undefined | number,
    iconHeight?: undefined | number,
    rowHeight?: undefined | string,
}) {

    const [t] = useTranslation();

    const imageHeight = props.imageHeight || 60;
    const rowHeight = props.rowHeight || '100px';
    const iconHeight = props.iconHeight || 40;

    const useTranslate = (input: string) => t(input as any);

    // @ts-ignore
    return (
        <Grid container alignItems="center" justifyContent={"center"} sx={{ height: rowHeight, p: 0 }}>
            <Grid
                size={{
                    xs: 3,
                    md: 2
                }}>
                <ExerciseImageAvatar
                    image={props.setting.base?.mainImage}
                    iconSize={iconHeight}
                    avatarSize={imageHeight}
                />
            </Grid>

            <Grid size={9}>
                <Stack spacing={0}>
                    <Typography variant={"subtitle1"}>
                        {props.setting.base?.getTranslation().name}
                    </Typography>
                    <Typography>
                        {props.set.getSettingsTextRepresentation(props.setting.base!, useTranslate)}
                    </Typography>
                    <Typography variant={"caption"}>
                        {props.set.comment}
                    </Typography>
                </Stack>
            </Grid>
        </Grid>
    );
}


function SetList(props: {
    set: WorkoutSet,
    index: number,
}) {
    const [t, i18n] = useTranslation();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const navigateEditSet = () => window.location.href = makeLink(
        WgerLink.ROUTINE_EDIT_SET,
        i18n.language,
        { id: props.set.id }
    );
    const navigateDeleteSet = () => window.location.href = makeLink(
        WgerLink.ROUTINE_DELETE_SET,
        i18n.language,
        { id: props.set.id }
    );


    return (
        <Grid
            container
            spacing={2}
            justifyContent="space-between"
            alignItems="flex-start"
        >
            <Grid size={11}>
                {props.set.settingsFiltered.map((setting) =>
                    <SettingDetails
                        setting={setting}
                        set={props.set}
                        key={setting.id}
                    />
                )}
            </Grid>
            <Grid textAlign={"right"} size={1}>
                <IconButton aria-label="settings" onClick={handleClick}>
                    <MoreVertIcon fontSize="small" />
                </IconButton>
                <Menu
                    id="basic-menu"
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    MenuListProps={{ 'aria-labelledby': 'basic-button' }}
                >
                    <MenuItem onClick={navigateEditSet}>
                        {t('edit')}
                    </MenuItem>
                    <MenuItem onClick={navigateDeleteSet}>
                        {t('delete')}
                    </MenuItem>
                </Menu>
            </Grid>
        </Grid>
    );
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

    const navigateEditDay = () => window.location.href = makeLink(
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
                <MenuItem onClick={navigateEditDay}>
                    {t('edit')}
                </MenuItem>
                <Divider />
                <MenuItem onClick={navigateDeleteDay}>
                    <Delete />
                    {t('delete')}
                </MenuItem>
            </Menu>
            <CardContent>
                <Stack divider={<Divider flexItem />}>
                    {props.day.sets.map((set, index) => (
                        <SetList
                            set={set}
                            index={index}
                            key={set.id}
                        />
                    ))}
                </Stack>
            </CardContent>
            <CardActions>
                <IconButton onClick={navigateAddSet}>
                    <Add />
                </IconButton>
            </CardActions>
        </Card>
    );
};
