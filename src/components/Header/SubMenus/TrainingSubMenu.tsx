import { Button, Menu, MenuItem } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { usePreferences } from "state/PreferencesContext";
import { makeLink, WgerLink } from "utils/url";

export const TrainingSubMenu = () => {
    const { i18n } = useTranslation();
    const [anchorElRoutine, setAnchorElRoutine] = React.useState<null | HTMLElement>(null);

    const {
        showRoutineOverview,
        showPrivateTemplate,
        showPublicTemplate,
        showExerciseOverview,
        showExerciseContribute,
        showCalendar,
    } = usePreferences();

    return (
        <>
            <Button color="inherit" onClick={(event) => setAnchorElRoutine(event.currentTarget)}>
                Routines
            </Button>
            <Menu anchorEl={anchorElRoutine} open={Boolean(anchorElRoutine)} onClose={() => setAnchorElRoutine(null)}>
                {showRoutineOverview && (
                    <MenuItem component={Link} to={makeLink(WgerLink.ROUTINE_OVERVIEW, i18n.language)}>
                        Routine overview
                    </MenuItem>
                )}
                {showPrivateTemplate && (
                    <MenuItem component={Link} to={makeLink(WgerLink.PRIVATE_TEMPLATE_OVERVIEW, i18n.language)}>
                        Private template overview
                    </MenuItem>
                )}
                {showPublicTemplate && (
                    <MenuItem component={Link} to={makeLink(WgerLink.PUBLIC_TEMPLATE_OVERVIEW, i18n.language)}>
                        Public template overview
                    </MenuItem>
                )}
                {showExerciseOverview && (
                    <MenuItem component={Link} to={makeLink(WgerLink.EXERCISE_OVERVIEW, i18n.language)}>
                        Exercise overview
                    </MenuItem>
                )}
                {showExerciseContribute && (
                    <MenuItem component={Link} to={makeLink(WgerLink.EXERCISE_CONTRIBUTE, i18n.language)}>
                        Contribute exercise
                    </MenuItem>
                )}
                {showCalendar && (
                    <MenuItem component={Link} to={makeLink(WgerLink.CALENDAR, i18n.language)}>
                        Calendar
                    </MenuItem>
                )}
            </Menu>
        </>
    );
};
