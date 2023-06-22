import { Link } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import { Button, Menu, MenuItem } from "@mui/material";
import { makeLink, WgerLink } from "utils/url";
import React from "react";

export const TrainingSubMenu = () => {

    const { i18n } = useTranslation();
    const [anchorElWorkout, setAnchorElWorkout] = React.useState<null | HTMLElement>(null);

    return (
        <>
            <Button color="inherit" onClick={(event) => setAnchorElWorkout(event.currentTarget)}>
                Routines
            </Button>
            <Menu
                anchorEl={anchorElWorkout}
                open={Boolean(anchorElWorkout)}
                onClose={() => setAnchorElWorkout(null)}
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
            </Menu>
        </>
    );
};
