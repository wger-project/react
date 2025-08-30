import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Chip, Divider, List, ListItem, ListItemButton, ListItemText, Paper, } from "@mui/material";
import { LoadingPlaceholder } from "components/Core/LoadingWidget/LoadingWidget";
import { WgerContainerRightSidebar } from "components/Core/Widgets/Container";
import { OverviewEmpty } from "components/Core/Widgets/OverviewEmpty";
import { Routine } from "components/WorkoutRoutines/models/Routine";
import { AddRoutineFab } from "components/WorkoutRoutines/Overview/Fab";
import { useRoutinesShallowQuery } from "components/WorkoutRoutines/queries";
import React from "react";
import { useTranslation } from "react-i18next";
import { makeLink, WgerLink } from "utils/url";

export const RoutineList = (props: { routine: Routine, linkDestination?: WgerLink, showTemplateChip?: boolean }) => {
    const [t, i18n] = useTranslation();

    const showTemplateChip = props.showTemplateChip ?? true;

    const destination = props.linkDestination ?? WgerLink.ROUTINE_DETAIL;
    const detailUrl = makeLink(destination, i18n.language, { id: props.routine.id });

    const primaryText = props.routine.name !== '' ? props.routine.name : t('routines.routine');
    const chip = props.routine.isTemplate && showTemplateChip
        ? <Chip color="info" size="small" label={t('routines.template')} />
        : null;


    return <>
        <ListItem sx={{ p: 0 }}>
            <ListItemButton component="a" href={detailUrl}>
                <ListItemText
                    primary={<>{primaryText} {chip}</>}
                    secondary={`${props.routine.durationText} (${props.routine.start.toLocaleDateString()} - ${props.routine.end.toLocaleDateString()})`}
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
    // create the fabRef to pass it to OverviewEmpty and AddRoutineFab
    const fabRef = React.useRef<HTMLButtonElement>(null);

    if (routineQuery.isLoading) {
        return <LoadingPlaceholder />;
    }


    return <WgerContainerRightSidebar
        title={t("routines.routines")}
        mainContent={<>
            {routineQuery.data!.length === 0
                ? <OverviewEmpty fabRef={fabRef} />
                : <Paper>
                    <List sx={{ py: 0 }} key={'abc'}>
                        {routineQuery.data!.map(r => <RoutineList routine={r} key={r.id} />)}
                    </List>
                </Paper>}
        </>}
        fab={<AddRoutineFab ref={fabRef} />}  
    />;
};
