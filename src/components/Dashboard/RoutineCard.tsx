import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import TodayIcon from "@mui/icons-material/Today";
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
import { getDayName } from "components/WorkoutRoutines/models/Day";
import { Routine } from "components/WorkoutRoutines/models/Routine";
import { RoutineDayData } from "components/WorkoutRoutines/models/RoutineDayData";
import { useActiveRoutineQuery } from "components/WorkoutRoutines/queries";
import { SetConfigDataDetails } from "components/WorkoutRoutines/widgets/RoutineDetailsCard";
import React, { useState } from 'react';
import { useTranslation } from "react-i18next";
import { isSameDay } from "utils/date";
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
                {props.routine.dayDataCurrentIterationNoNulls.map((dayData) =>
                    <DayListItem dayData={dayData} key={`dayDetails-${dayData.date.toISOString()}`} />)}
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

    const handleToggleExpand = () => setExpandView(!expandView);

    return (<>
        <ListItemButton
            onClick={handleToggleExpand}
            selected={expandView}
            disabled={props.dayData.day === null || props.dayData.day?.isRest}
        >
            <ListItemIcon>
                {expandView ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </ListItemIcon>
            <ListItemText
                primary={getDayName(props.dayData.day)}
                slotProps={{ secondary: { noWrap: true, style: { overflow: 'hidden', textOverflow: 'ellipsis' } } }}
                secondary={props.dayData.day?.description}
            />
            <ListItemIcon>
                {isSameDay(props.dayData.date, new Date()) ? <TodayIcon /> : undefined}
            </ListItemIcon>
        </ListItemButton>

        <Collapse in={expandView} timeout="auto" unmountOnExit>
            {props.dayData.slots.map((slotData, index) => (<div key={index}>
                {slotData.setConfigs.map((setConfigData, index) =>
                    <SetConfigDataDetails
                        setConfigData={setConfigData}
                        key={index}
                        rowHeight={'70px'}
                        showExercise={true}
                    />
                )}
            </div>))}
        </Collapse>
    </>);
};