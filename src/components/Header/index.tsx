import { AppBar, Toolbar, Typography } from "@mui/material";
import { BodyWeightSubMenu } from "components/Header/SubMenus/BodyWeightSubMenu";
import { MeasurementsSubMenu } from "components/Header/SubMenus/MeasurementsSubMenu";
import { NutritionSubMenu } from "components/Header/SubMenus/NutritionSubMenu";
import { TrainingSubMenu } from "components/Header/SubMenus/TrainingSubMenu";
import { PreferenceButton } from "./SubMenus/PreferenceButton";
import { usePreferences } from "state/PreferencesContext";
import React from "react";

export const Header = () => {
    const { showTraining, showBodyWeight, showMeasurements, showNutrition } = usePreferences();

    return (
        <AppBar
            position="static"
            sx={{
                flex: "auto",
                flexDirection: "row",
                justifyContent: "space-between",
            }}
        >
            <Toolbar>
                <Typography variant="h6" component="div" mr={3}>
                    wger
                </Typography>

                {showTraining && <TrainingSubMenu />}
                {showBodyWeight && <BodyWeightSubMenu />}
                {showMeasurements && <MeasurementsSubMenu />}
                {showNutrition && <NutritionSubMenu />}
            </Toolbar>
            <PreferenceButton />
        </AppBar>
    );
};
