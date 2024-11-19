import { Button, Menu, MenuItem } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from 'react-router-dom';
import { makeLink, WgerLink } from "utils/url";

export const TrainingSubMenu = () => {

    const { i18n } = useTranslation();
    const [anchorElRoutine, setAnchorElRoutine] = React.useState<null | HTMLElement>(null);

    return (
        <>
            <Button color="inherit" onClick={(event) => setAnchorElRoutine(event.currentTarget)}>
                Routines
            </Button>
            <Menu
                anchorEl={anchorElRoutine}
                open={Boolean(anchorElRoutine)}
                onClose={() => setAnchorElRoutine(null)}
            >
                <MenuItem component={Link} to={makeLink(WgerLink.ROUTINE_OVERVIEW, i18n.language)}>
                    Routine overview
                </MenuItem>
                <MenuItem component={Link} to={makeLink(WgerLink.EXERCISE_OVERVIEW, i18n.language)}>
                    Exercise overview
                </MenuItem>
                <MenuItem component={Link} to={makeLink(WgerLink.EXERCISE_CONTRIBUTE, i18n.language)}>
                    Contribute exercise
                </MenuItem>
                <MenuItem component={Link} to={makeLink(WgerLink.CALENDAR, i18n.language)}>
                    Calendar
                </MenuItem>
            </Menu>
        </>
    );
};
