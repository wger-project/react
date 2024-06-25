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
import { uuid4 } from "components/Core/Misc/uuid";
import { EmptyCard } from "components/Dashboard/EmptyCard";
import { SettingDetails } from "components/WorkoutRoutines/Detail/RoutineDetails";
import { Routine } from "components/WorkoutRoutines/models/Routine";
import { RoutineDayData } from "components/WorkoutRoutines/models/RoutineDayData";
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
                {props.routine.dayDataCurrentIteration.map(day => <DayListItem dayData={day} key={uuid4()} />)}
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
        <ListItemButton onClick={handleToggleExpand} selected={expandView} disabled={props.dayData.day.isRest}>
            <ListItemIcon>
                {expandView ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </ListItemIcon>
            <ListItemText
                primary={props.dayData.day.isRest ? t('routines.restDay') : props.dayData.day.name}
            />
        </ListItemButton>

        <Collapse in={expandView} timeout="auto" unmountOnExit>
            {props.dayData.slots.map((slotData) => (<div key={uuid4()}>
                {slotData.setConfigs.map((setting) =>
                    <SettingDetails
                        setConfigData={setting}
                        key={uuid4()}
                        // imageHeight={45}
                        // iconHeight={25}
                        rowHeight={'70px'}
                    />
                )}
            </div>))}
        </Collapse>
    </>);
};