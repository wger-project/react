import { Button, Menu, MenuItem } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { makeLink, WgerLink } from "../../../utils/url";

export const WorkoutSubMenu = () => {
    const { i18n } = useTranslation();
    const [anchorElWorkout, setAnchorElWorkout] = React.useState<null | HTMLElement>(null);


    return (
        <>
            <Button color="inherit" onClick={(event) => setAnchorElWorkout(event.currentTarget)}>
                Workout
            </Button>
            <Menu
                anchorEl={anchorElWorkout}
                open={Boolean(anchorElWorkout)}
                onClose={() => setAnchorElWorkout(null)}
            >
                <MenuItem component={Link} to={makeLink(WgerLink.CALENDAR, i18n.language)}>
                    Calendar
                </MenuItem>
            </Menu>
        </>
    );
};