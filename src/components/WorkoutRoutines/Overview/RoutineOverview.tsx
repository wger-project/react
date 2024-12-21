import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Divider, List, ListItem, ListItemButton, ListItemText, Paper, } from "@mui/material";
import { LoadingPlaceholder } from "components/Core/LoadingWidget/LoadingWidget";
import { WgerContainerRightSidebar } from "components/Core/Widgets/Container";
import { OverviewEmpty } from "components/Core/Widgets/OverviewEmpty";
import { Routine } from "components/WorkoutRoutines/models/Routine";
import { AddRoutineFab } from "components/WorkoutRoutines/Overview/Fab";
import { useRoutinesShallowQuery } from "components/WorkoutRoutines/queries";
import React from "react";
import { useTranslation } from "react-i18next";
import { makeLink, WgerLink } from "utils/url";

const RoutineList = (props: { routine: Routine }) => {
    const [t, i18n] = useTranslation();
    const detailUrl = makeLink(WgerLink.ROUTINE_DETAIL, i18n.language, { id: props.routine.id });

    return <>
        <ListItem sx={{ p: 0 }}>
            <ListItemButton component="a" href={detailUrl}>
                <ListItemText
                    primary={props.routine.name !== '' ? props.routine.name : t('routines.routine')}
                    secondary={`${props.routine.start.toLocaleDateString()} - ${props.routine.end.toLocaleDateString()}`}
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

    if (routineQuery.isLoading) {
        return <LoadingPlaceholder />;
    }


    return <WgerContainerRightSidebar
        title={t("routines.routines")}
        mainContent={<>
            {routineQuery.data!.length === 0
                ? <OverviewEmpty />
                : <Paper>
                    <List sx={{ py: 0 }} key={'abc'}>
                        {routineQuery.data!.map(r => <RoutineList routine={r} key={r.id} />)}
                    </List>
                </Paper>}
        </>}
        fab={<AddRoutineFab />}
    />;
};
