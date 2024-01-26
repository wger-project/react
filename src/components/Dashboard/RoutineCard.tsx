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
import { SettingDetails } from "components/WorkoutRoutines/Detail/RoutineDetails";
import { Day } from "components/WorkoutRoutines/models/Day";
import { useActiveRoutineQuery } from "components/WorkoutRoutines/queries";
import React, { useState } from 'react';
import { useTranslation } from "react-i18next";
import { daysOfWeek } from "utils/date";
import { makeLink, WgerLink } from "utils/url";

export const RoutineCard = () => {

    const [t, i18n] = useTranslation();
    const routineQuery = useActiveRoutineQuery();

    return (<>
        {routineQuery.isLoading
            ? <LoadingPlaceholder />
            : <Card>
                <CardHeader
                    title={t('routines.routine')}
                    subheader={routineQuery.data !== null ? routineQuery.data?.name : '.'}
                />
                {/* Note: not 5100 like the other, but a bit more since we don't have an action icon... */}
                <CardContent sx={{ height: '510px', overflow: 'auto' }}>
                    {routineQuery.data !== null && <>
                        <List>
                            {routineQuery.data?.days.map((day) => <DayListItem day={day} key={day.id} />)}
                        </List>
                    </>}
                </CardContent>

                <CardActions>
                    <Button size="small"
                            href={makeLink(WgerLink.ROUTINE_DETAIL, i18n.language, { id: routineQuery.data?.id! })}>
                        {t('seeDetails')}
                    </Button>
                </CardActions>
            </Card>}
    </>);
};

const DayListItem = (props: { day: Day }) => {
    const [expandView, setExpandView] = useState(false);

    const handleToggleExpand = () => setExpandView(!expandView);

    return (
        <>
            <ListItemButton onClick={handleToggleExpand} selected={expandView}>
                <ListItemIcon>
                    {expandView ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </ListItemIcon>
                <ListItemText
                    primary={props.day.description}
                    secondary={props.day.daysOfWeek.map((dayId) => (daysOfWeek[dayId - 1])).join(", ")}
                />
            </ListItemButton>
            <Collapse in={expandView} timeout="auto" unmountOnExit>
                {props.day.sets.map((set) => (
                    <>
                        {set.settingsFiltered.map((setting) =>
                            <SettingDetails
                                setting={setting}
                                set={set}
                                key={setting.id}
                                imageHeight={45}
                                iconHeight={25}
                                rowHeight={'70px'}
                            />
                        )}
                    </>
                ))}

            </Collapse>
        </>
    );
};