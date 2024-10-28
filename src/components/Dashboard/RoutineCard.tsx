import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
    Button,
    Card,
    CardActions,
    CardContent,
    CardHeader,
    Collapse,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
} from '@mui/material';
import { LoadingPlaceholder } from "components/Core/LoadingWidget/LoadingWidget";
import { EmptyCard } from "components/Dashboard/EmptyCard";
import { SetConfigDataDetails } from "components/WorkoutRoutines/Detail/RoutineDetailsCard";
import { Routine } from "components/WorkoutRoutines/models/Routine";
import { RoutineDayData } from "components/WorkoutRoutines/models/RoutineDayData";
import { useActiveRoutineQuery } from "components/WorkoutRoutines/queries";
import React, { useState } from 'react';
import { useTranslation } from "react-i18next";
import { makeLink, WgerLink } from "utils/url";


export const RoutineCard = () => {
    const [t, i18n] = useTranslation();
    const routineQuery = useActiveRoutineQuery();

    if (routineQuery.isLoading) {
        return <LoadingPlaceholder />;
    }

    return routineQuery.data !== null
        ? <RoutineCardContent routine={routineQuery.data!} />
        : <EmptyCard
            title={t('routines.routine')}
            link={makeLink(WgerLink.ROUTINE_ADD, i18n.language)}
        />;
};

const RoutineCardContent = (props: { routine: Routine }) => {
    const [t, i18n] = useTranslation();

    return <Card>
        <CardHeader
            title={t('routines.routine')}
            subheader={props.routine.name ?? "."}
        />
        {/* Note: not 500 like the other cards, but a bit more since we don't have an action icon... */}
        <CardContent sx={{ height: "510px", overflow: "auto" }}>
            <List>
                {props.routine.dayDataCurrentIteration.map((day, index) => <DayListItem dayData={day} key={index} />)}
            </List>
        </CardContent>

        <CardActions>
            <Button size="small"
                    href={makeLink(WgerLink.ROUTINE_DETAIL, i18n.language, { id: props.routine.id! })}>
                {t('seeDetails')}
            </Button>
        </CardActions>
    </Card>;
};

const DayListItem = (props: { dayData: RoutineDayData }) => {
    const [expandView, setExpandView] = useState(false);
    const [t] = useTranslation();


    const handleToggleExpand = () => setExpandView(!expandView);

    return (<>
        <ListItemButton onClick={handleToggleExpand} selected={expandView} disabled={props.dayData.day?.isRest}>
            <ListItemIcon>
                {expandView ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </ListItemIcon>
            <ListItemText
                primary={props.dayData.day?.isRest ? t('routines.restDay') : props.dayData.day?.name}
            />
        </ListItemButton>

        <Collapse in={expandView} timeout="auto" unmountOnExit>
            {props.dayData.slots.map((slotData, index) => (<div key={index}>
                {slotData.setConfigs.map((setting, index) =>
                    <SetConfigDataDetails
                        setConfigData={setting}
                        key={index}
                        rowHeight={'70px'}
                        showExercise={true}
                    />
                )}
            </div>))}
        </Collapse>
    </>);
};