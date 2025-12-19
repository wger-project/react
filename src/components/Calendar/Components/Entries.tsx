import { ExpandLess, ExpandMore } from '@mui/icons-material';
import {
    Card,
    CardContent,
    CardHeader,
    Collapse,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Typography
} from '@mui/material';
import React from 'react';
import { useTranslation } from "react-i18next";
import { dateToLocale } from "utils/date";
import { DayProps } from "./CalendarComponent";

interface LogProps {
    selectedDay: DayProps;
    showBorder?: boolean;
}

const Entries: React.FC<LogProps> = ({ selectedDay, showBorder }) => {
    const [t] = useTranslation();

    const [openMeasurements, setOpenMeasurements] = React.useState(false);
    const [openSession, setOpenSession] = React.useState(false);
    const [openNutritionDiary, setOpenNutritionDiary] = React.useState(false);

    showBorder = showBorder ?? true;

    return (
        <Card
            sx={{
                boxShadow: showBorder ? undefined : 'none',
                width: { xs: 'auto', md: '45%' },
                height: { xs: '60%', md: '100%' },
                // m: { xs: 0, sm: 1, md: 2 },
                // p: { xs: 1, sm: 1.5, md: 2 }

            }}
        >
            <CardHeader
                title={
                    <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                        {t("entries")} - {dateToLocale(selectedDay.date)}
                    </Typography>
                }
            />
            <CardContent sx={{
                flex: 1,
                height: '100%',
                overflow: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 2
            }}>
                <List>
                    {/* Weight entries */}
                    {selectedDay.weightEntry &&
                        <ListItem>
                            <ListItemText
                                primary={t("weight")}
                                secondary={selectedDay.weightEntry.weight.toFixed(1)}
                                sx={{ pl: 2 }}
                            />
                        </ListItem>}

                    {/* One measurement */}
                    {selectedDay.measurements.length === 1 &&
                        <ListItem>
                            <ListItemText
                                primary={t("measurements.measurements")}
                                secondary={`${selectedDay.measurements[0].name}: ${selectedDay.measurements[0].value} ${selectedDay.measurements[0].unit}`}
                                sx={{ pl: 2 }}
                            />
                        </ListItem>}

                    {/* Measurements */}
                    {selectedDay.measurements.length > 1 && <>
                        <ListItem>
                            <ListItemButton
                                onClick={() => setOpenMeasurements(!openMeasurements)}
                                selected={openMeasurements}
                            >
                                <ListItemText primary={t("measurements.measurements")} />
                                {openMeasurements ? <ExpandLess /> : <ExpandMore />}
                            </ListItemButton>
                        </ListItem>
                        <Collapse in={openMeasurements} timeout="auto" unmountOnExit>
                            <List sx={{ pl: 4, pt: 0 }}>
                                {selectedDay.measurements.map((measurement, key) => (
                                    <ListItem key={key} dense>
                                        <ListItemText
                                            primary={measurement.name}
                                            secondary={`${measurement.value} ${measurement.unit}`}
                                        />
                                    </ListItem>))}
                            </List>
                        </Collapse>
                    </>}

                    {/* Workout session */}
                    {selectedDay.workoutSession && <>
                        <ListItem>
                            <ListItemButton
                                onClick={() => setOpenSession(!openSession)}
                                selected={openSession}
                            >
                                <ListItemText
                                    primary={t("routines.workoutSession")}
                                    secondary={selectedDay.workoutSession.textRepresentation}
                                    sx={{
                                        '& .MuiListItemText-secondary': {
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                        }
                                    }}
                                />
                                {openSession ? <ExpandLess /> : <ExpandMore />}
                            </ListItemButton>
                        </ListItem>
                        <Collapse in={openSession} timeout="auto" unmountOnExit>
                            <List sx={{ pl: 4, pt: 0 }}>
                                {selectedDay.workoutSession.logs.map((log, key) => (
                                    <ListItem key={key} dense>
                                        <ListItemText
                                            primary={log.exerciseObj?.getTranslation().name}
                                            secondary={`${log.repetitions} × ${log.weight} `}
                                        />
                                    </ListItem>))}
                            </List>
                        </Collapse>

                    </>}

                    {/* Nutrition diary */}
                    {selectedDay.nutritionLogs.length > 0 && <>
                        <ListItem>
                            <ListItemButton
                                onClick={() => setOpenNutritionDiary(!openNutritionDiary)}
                                selected={openNutritionDiary}
                            >
                                <ListItemText primary={t("nutrition.nutritionalDiary")} />
                                {openNutritionDiary ? <ExpandLess /> : <ExpandMore />}
                            </ListItemButton>
                        </ListItem>
                        <Collapse in={openNutritionDiary} timeout="auto" unmountOnExit>
                            <List sx={{ pl: 4, pt: 0 }}>
                                {selectedDay.nutritionLogs.map((log, key) => (
                                    <ListItem key={key} dense>
                                        <ListItemText
                                            primary={log.ingredient?.name}
                                            secondary={`${log.amount} ${t('nutrition.gramShort')}`}
                                        />
                                    </ListItem>))}
                            </List>
                        </Collapse>
                    </>}
                </List>

            </CardContent>
        </Card>
    );
};

export default Entries;