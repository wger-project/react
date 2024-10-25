import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Container, Divider, List, ListItem, ListItemButton, ListItemText, Paper, Typography, } from "@mui/material";
import Grid from '@mui/material/Grid2';
import { LoadingPlaceholder } from "components/Core/LoadingWidget/LoadingWidget";
import { WorkoutRoutine } from "components/WorkoutRoutines/models/WorkoutRoutine";
import { AddWorkoutFab } from "components/WorkoutRoutines/Overview/fab";
import { useRoutinesShallowQuery } from "components/WorkoutRoutines/queries";
import React from "react";
import { useTranslation } from "react-i18next";
import { makeLink, WgerLink } from "utils/url";

const RoutineList = (props: { routine: WorkoutRoutine }) => {
    const [t, i18n] = useTranslation();
    const detailUrl = makeLink(WgerLink.ROUTINE_DETAIL, i18n.language, { id: props.routine.id });

    return <>
        <ListItem sx={{ p: 0 }}>
            <ListItemButton component="a" href={detailUrl}>
                <ListItemText
                    primary={props.routine.name !== '' ? props.routine.name : t('routines.routine')}
                    secondary={props.routine.date.toLocaleDateString()}
                />
                <ChevronRightIcon />
            </ListItemButton>
        </ListItem>
        <Divider component="li" />
    </>;
};
export const RoutineOverview = () => {
    const routineQuery = useRoutinesShallowQuery();
    const [t] = useTranslation();

    return (
        <Container maxWidth="lg">

            <Grid container>
                <Grid
                    size={{
                        xs: 12,
                        sm: 8
                    }}>
                    <Typography gutterBottom variant="h3" component="div">
                        {t("routines.routines")}
                    </Typography>

                    {routineQuery.isLoading
                        ? <LoadingPlaceholder />
                        : <Paper>
                            <List sx={{ py: 0 }} key={'abc'}>
                                {routineQuery.data!.map(r => <RoutineList routine={r} key={r.id} />)}
                            </List>
                        </Paper>
                    }

                </Grid>
                <Grid
                    size={{
                        xs: 12,
                        sm: 4
                    }}>

                </Grid>
            </Grid>

            <AddWorkoutFab />

        </Container>
    );
};
