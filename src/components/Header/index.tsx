import { AppBar, Toolbar, Typography } from "@mui/material";
import { BodyWeightSubMenu } from "components/Header/SubMenus/BodyWeightSubMenu";
import { MeasurementsSubMenu } from "components/Header/SubMenus/MeasurementsSubMenu";
import { NutritionSubMenu } from "components/Header/SubMenus/NutritionSubMenu";
import { TrainingSubMenu } from "components/Header/SubMenus/TrainingSubMenu";
import React from 'react';


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
                <NutritionSubMenu />


            </Toolbar>
        </AppBar>
    );
};