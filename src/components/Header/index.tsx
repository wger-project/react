import React from 'react';
import { AppBar, Toolbar, Typography } from "@mui/material";
import { TrainingSubMenu } from "components/Header/SubMenus/TrainingSubMenu";
import { BodyWeightSubMenu } from "components/Header/SubMenus/BodyWeightSubMenu";
import { MeasurementsSubMenu } from "components/Header/SubMenus/MeasurementsSubMenu";


export const Header = () => {

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" component="div" mr={3}>
                    wger
                </Typography>

                <TrainingSubMenu />
                <BodyWeightSubMenu />
                <MeasurementsSubMenu />


            </Toolbar>
        </AppBar>
    );
};