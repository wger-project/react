import { Box, Button, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { StepProps } from "components/Exercises/Add/AddExerciseStepper";


export const Step6Overview = ({
                                  newExerciseData,
                                  onContinue,
                                  onBack,
                              }: StepProps) => {
    const [t] = useTranslation();


    const handleContinue = () => {
        onContinue();
    };

    return (
        <div>
            <Typography>
                Please make sure this is correct before continuing, etc. etc.
            </Typography>

            <p>Base data:</p>
            <ul>
                <li>Category ID: {newExerciseData!.category}</li>
                <li>Muscles: {newExerciseData!.muscles.join("/ ")}</li>
                <li>Muscles secondary: {newExerciseData!.musclesSecondary.join("/ ")}</li>
                <li>Equipment: {newExerciseData!.equipment.join("/ ")}</li>
            </ul>
            <p>English data:</p>
            <ul>
                <li>Name EN: {newExerciseData!.nameEn}</li>
                <li>Description EN: {newExerciseData!.descriptionEn}</li>
                <li>
                    Alternative names EN:{" "}
                    {newExerciseData!.alternativeNamesEn.join("/ ")}
                </li>
            </ul>

            <p>Translations:</p>
            <ul>
                <li>Language ID: {newExerciseData!.languageId}</li>
                <li>Name translation: {newExerciseData!.nameTranslation}</li>
                <li>
                    Description translation: {newExerciseData!.descriptionTranslation}
                </li>
                <li>
                    Alternative names translation:{" "}
                    {newExerciseData!.alternativeNamesTranslation.join("/ ")}
                </li>
            </ul>
            <p>Images:</p>
            <ul>
                <li>Images: {newExerciseData!.images.join("/ ")}</li>
            </ul>


            <Box sx={{ mb: 2 }}>
                <div>
                    <Button
                        variant="contained"
                        onClick={handleContinue}
                        sx={{ mt: 1, mr: 1 }}
                    >
                        {t("exercises.submit-exercise")}
                    </Button>
                    <Button disabled={false} onClick={onBack} sx={{ mt: 1, mr: 1 }}>
                        {t("back")}
                    </Button>
                </div>
            </Box>
        </div>
    );
};
