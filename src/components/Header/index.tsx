import React from 'react';
import { AppBar, Button, Menu, MenuItem, Toolbar, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";


export const Header = () => {
    const { i18n } = useTranslation();
    const [anchorElWorkout, setAnchorElWorkout] = React.useState<null | HTMLElement>(null);
    const [anchorElWeight, setAnchorElWeight] = React.useState<null | HTMLElement>(null);

    return (

        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" component="div" mr={3}>
                    wger
                </Typography>
                <Button color="inherit" onClick={(event) => setAnchorElWorkout(event.currentTarget)}>
                    Workout
                </Button>
                <Menu
                    anchorEl={anchorElWorkout}
                    open={Boolean(anchorElWorkout)}
                    onClose={() => setAnchorElWorkout(null)}
                >
                    <MenuItem component={Link} to={`${i18n.language}/exercise/overview`}>Exercise overview</MenuItem>
                    <MenuItem component={Link} to={`${i18n.language}/exercise/add`}>Contribute exercise</MenuItem>
                </Menu>

                <Button color="inherit" onClick={(event) => setAnchorElWeight(event.currentTarget)}>
                    Weight
                </Button>
                <Menu
                    anchorEl={anchorElWeight}
                    open={Boolean(anchorElWeight)}
                    onClose={() => setAnchorElWeight(null)}
                >
                    <MenuItem component={Link} to={`${i18n.language}/weight/overview`}>Weight overview</MenuItem>
                    <MenuItem component={Link} to={`${i18n.language}/weight/add`}>Add weight entry</MenuItem>
                </Menu>
            </Toolbar>
        </AppBar>
    );
};