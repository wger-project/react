import { List, ListItem, ListItemText, Switch, Paper, Divider, Typography } from "@mui/material";
import { WgerContainerRightSidebar } from "components/Core/Widgets/Container";
import { usePreferences } from "state/PreferencesContext";
import React from "react";

export const Preferences = () => {
    const prefs = usePreferences();

    return (
        <WgerContainerRightSidebar
            title={"User Preferences"}
            mainContent={
                <Paper>
                    <List sx={{ py: 0 }}>
                        <Typography variant="h6" sx={{ px: 2, pt: 1 }}>
                            Submenus
                        </Typography>
                        {(
                            [
                                ["Show Training", prefs.showTraining, prefs.setShowTraining],
                                ["Show Body Weight", prefs.showBodyWeight, prefs.setShowBodyWeight],
                                ["Show Measurements", prefs.showMeasurements, prefs.setShowMeasurements],
                                ["Show Nutrition", prefs.showNutrition, prefs.setShowNutrition],
                            ] as [string, boolean, (v: boolean) => void][]
                        ).map(([label, value, setter]) => (
                            <ListItem
                                key={label}
                                secondaryAction={
                                    <Switch edge="end" checked={value} onChange={(e) => setter(e.target.checked)} />
                                }
                            >
                                <ListItemText primary={label} />
                            </ListItem>
                        ))}

                        <Divider sx={{ my: 1 }} />
                        <Typography variant="h6" sx={{ px: 2, pt: 1 }}>
                            Training submenu
                        </Typography>

                        {(
                            [
                                ["Routine overview", prefs.showRoutineOverview, prefs.setShowRoutineOverview],
                                ["Private template", prefs.showPrivateTemplate, prefs.setShowPrivateTemplate],
                                ["Public template", prefs.showPublicTemplate, prefs.setShowPublicTemplate],
                                ["Exercise overview", prefs.showExerciseOverview, prefs.setShowExerciseOverview],
                                ["Contribute exercise", prefs.showExerciseContribute, prefs.setShowExerciseContribute],
                                ["Calendar", prefs.showCalendar, prefs.setShowCalendar],
                            ] as [string, boolean, (v: boolean) => void][]
                        ).map(([label, value, setter]) => (
                            <ListItem
                                key={label}
                                secondaryAction={
                                    <Switch edge="end" checked={value} onChange={(e) => setter(e.target.checked)} />
                                }
                            >
                                <ListItemText primary={label} />
                            </ListItem>
                        ))}
                    </List>
                </Paper>
            }
        />
    );
};
