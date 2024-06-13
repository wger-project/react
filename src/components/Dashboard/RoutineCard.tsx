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
import { SettingDetails } from "components/WorkoutRoutines/Detail/RoutineDetails";
import { Day } from "components/WorkoutRoutines/models/Day";
import { Routine } from "components/WorkoutRoutines/models/Routine";
import { useActiveRoutineQuery } from "components/WorkoutRoutines/queries";
import React, { useState } from 'react';
import { useTranslation } from "react-i18next";
import { makeLink, WgerLink } from "utils/url";


export const RoutineCard = () => {
    const [t, i18n] = useTranslation();
    const routineQuery = useActiveRoutineQuery();

    return (<>{routineQuery.isLoading
        ? <LoadingPlaceholder />
        : <>{routineQuery.data !== null
            ? <RoutineCardContent routine={routineQuery.data!} />
            : <EmptyCard
                title={t('routines.routine')}
                link={makeLink(WgerLink.ROUTINE_ADD, i18n.language)}
            />}
        </>
    }</>);
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
                {props.routine.days.map(day => <DayListItem day={day} key={day.id} />)}
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

// <RoutineCardContent routine={routineQuery.data!} />

const DayListItem = (props: { day: Day }) => {
    const [expandView, setExpandView] = useState(false);

    const handleToggleExpand = () => setExpandView(!expandView);

    return (<>
        <ListItemButton onClick={handleToggleExpand} selected={expandView}>
            <ListItemIcon>
                {expandView ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </ListItemIcon>
            <ListItemText
                primary={props.day.description}
            />
        </ListItemButton>

        <Collapse in={expandView} timeout="auto" unmountOnExit>
            {props.day.slots.map((set) => (<div key={set.id}>
                {set.settingsFiltered.map((setting) =>
                    <SettingDetails
                        setConfigData={setting}
                        set={set}
                        key={setting.id}
                        imageHeight={45}
                        iconHeight={25}
                        rowHeight={'70px'}
                    />
                )}
            </div>))}
        </Collapse>
    </>);
};