import { AppBar, Toolbar, Typography } from "@mui/material";
import { BodyWeightSubMenu } from "@/app/layout/Header/SubMenus/BodyWeightSubMenu";
import { MeasurementsSubMenu } from "@/app/layout/Header/SubMenus/MeasurementsSubMenu";
import { NutritionSubMenu } from "@/app/layout/Header/SubMenus/NutritionSubMenu";
import { TrainingSubMenu } from "@/app/layout/Header/SubMenus/TrainingSubMenu";
import React from 'react';


export const Header = () => {

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ mr: 3 }}>
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