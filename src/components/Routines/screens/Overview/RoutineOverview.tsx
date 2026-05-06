import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Chip, Divider, List, ListItem, ListItemButton, ListItemText, Paper, } from "@mui/material";
import { LoadingPlaceholder } from "@/core/ui/LoadingWidget/LoadingWidget";
import { WgerContainerRightSidebar } from "@/core/ui/Widgets/Container";
import { OverviewEmpty } from "@/core/ui/Widgets/OverviewEmpty";
import { Routine } from "@/components/Routines/models/Routine";
import { AddRoutineFab } from "@/components/Routines/screens/Overview/Fab";
import { useRoutinesShallowQuery } from "@/components/Routines/queries";
import React from "react";
import { useTranslation } from "react-i18next";
import { dateToLocale } from "@/core/lib/date";
import { makeLink, WgerLink } from "@/core/lib/url";

export const RoutineList = (props: {
    routine: Routine,
    linkDestination?: WgerLink,
    showTemplateChip?: boolean,
    showTemplateVisibility?: boolean
}) => {
    const [t, i18n] = useTranslation();

    const showTemplateChip = props.showTemplateChip ?? true;
    const showTemplateVisibility = props.showTemplateVisibility ?? false;

    const destination = props.linkDestination ?? WgerLink.ROUTINE_DETAIL;
    const detailUrl = makeLink(destination, i18n.language, { id: props.routine.id! });

    const primaryText = props.routine.name !== '' ? props.routine.name : t('routines.routine');

    const chipTemplate = props.routine.isTemplate && showTemplateChip
        ? <Chip color="info" size="small" label={t('routines.template')} />
        : null;

    const chipVisibility = props.routine.isTemplate && showTemplateVisibility
        ? <Chip color="info" size="small"
                label={t(props.routine.isPublic ? 'public' : 'private')} />
        : null;


    return <>
        <ListItem sx={{ p: 0 }}>
            <ListItemButton component="a" href={detailUrl}>
                <ListItemText
                    primary={<>{primaryText} {chipTemplate} {chipVisibility}</>}
                    secondary={`${props.routine.durationText} (${dateToLocale(props.routine.start)} - ${dateToLocale(props.routine.end)})`}
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
