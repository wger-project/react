import { useBodyWeightCategoryQuery, useDisplayWeightUnit } from "@/components/Measurements";
import { useDeleteSessionQuery, WorkoutSession } from "@/components/Routines";
import { dateToLocale } from "@/core/lib/date";
import { DeleteConfirmationModal } from "@/core/ui/Modals/DeleteConfirmationModal";
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import {
    Card,
    CardContent,
    CardHeader,
    Collapse,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Typography
} from '@mui/material';
import React from 'react';
import { useTranslation } from "react-i18next";
import type { DayProps } from "./CalendarComponent";

interface LogProps {
    selectedDay: DayProps;
    isStandalone?: boolean;
}

const Entries: React.FC<LogProps> = ({ selectedDay, isStandalone }) => {
    const [t] = useTranslation();
    const displayWeightUnit = useDisplayWeightUnit();
    // Entries without their own unit fall back to the one of the category
    const categoryUnit = useBodyWeightCategoryQuery().data?.unit ?? 'kg';

    const [openMeasurements, setOpenMeasurements] = React.useState(false);
    // A day can hold several sessions, at most one of them is expanded
    const [openSessionId, setOpenSessionId] = React.useState<string | null>(null);
    const [openNutritionDiary, setOpenNutritionDiary] = React.useState(false);
    const [sessionToDelete, setSessionToDelete] = React.useState<WorkoutSession | null>(null);
    const deleteSessionQuery = useDeleteSessionQuery();

    isStandalone = isStandalone ?? true;

    return (
        <Card
            sx={{
                boxShadow: isStandalone ? undefined : 'none',
                width: { xs: 'auto', md: '45%' },
                height: { xs: '60%', md: '100%' },
                display: 'flex',
                flexDirection: 'column',
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
                // flex items don't shrink below their content size without this,
                // so the internal scrollbar would never appear
                minHeight: 0,
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
                                secondary={`${selectedDay.weightEntry.valueIn(displayWeightUnit, categoryUnit).toFixed(1)} ${t(`server.${displayWeightUnit}`)}`}
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
                                {selectedDay.measurements.map((measurement) => (
                                    <ListItem
                                        key={`${measurement.date.toISOString()}-${measurement.name}-${measurement.unit}`}
                                        dense>
                                        <ListItemText
                                            primary={measurement.name}
                                            secondary={`${measurement.value} ${measurement.unit}`}
                                        />
                                    </ListItem>))}
                            </List>
                        </Collapse>
                    </>}

                    {/* Workout sessions */}
                    {selectedDay.workoutSessions.map((session) => <React.Fragment key={session.id}>
                        <ListItem
                            secondaryAction={
                                <IconButton
                                    edge="end"
                                    aria-label={t("delete")}
                                    onClick={() => setSessionToDelete(session)}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            }
                        >
                            <ListItemButton
                                onClick={() => setOpenSessionId(openSessionId === session.id ? null : session.id)}
                                selected={openSessionId === session.id}
                            >
                                <ListItemText
                                    primary={t("routines.workoutSession")}
                                    secondary={session.textRepresentation}
                                    sx={{
                                        '& .MuiListItemText-secondary': {
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                        }
                                    }}
                                />
                                {openSessionId === session.id ? <ExpandLess /> : <ExpandMore />}
                            </ListItemButton>
                        </ListItem>
                        <Collapse in={openSessionId === session.id} timeout="auto" unmountOnExit>
                            <List sx={{ pl: 4, pt: 0 }}>
                                {session.logs.map((log) => (
                                    <ListItem key={log.id} dense>
                                        <ListItemText
                                            primary={log.exerciseObj?.getTranslation().name}
                                            secondary={`${log.repetitions} × ${log.weight} `}
                                        />
                                    </ListItem>))}
                            </List>
                        </Collapse>
                    </React.Fragment>)}

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
                                {selectedDay.nutritionLogs.map((log) => (
                                    <ListItem key={log.id} dense>
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

            <DeleteConfirmationModal
                title={t('deleteConfirmation', { name: t("routines.workoutSession") })}
                message={t("routines.deleteSessionInfo")}
                isOpen={sessionToDelete !== null}
                closeFn={() => setSessionToDelete(null)}
                deleteFn={() => deleteSessionQuery.mutate(sessionToDelete!)}
            />
        </Card>
    );
};

export default Entries;
