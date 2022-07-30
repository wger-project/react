import { Box, Button, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { StepProps } from "components/Exercises/Add/AddExerciseStepper";
import { addExerciseBase, addExerciseTranslation, postAlias, postExerciseImage } from "services";
import { ENGLISH_LANGUAGE_ID } from "utils/consts";


export const Step6Overview = ({
                                  newExerciseData,
                                  setNewExerciseData,
                                  onBack,
                              }: StepProps) => {
    const [t] = useTranslation();

    const submitExercise = async () => {
        // Create the base
        const baseId = await addExerciseBase(
            newExerciseData.category as number,
            newExerciseData.equipment,
            newExerciseData.muscles,
            newExerciseData.musclesSecondary
        );

        // Create the English translation
        const exerciseId = await addExerciseTranslation(
            baseId,
            ENGLISH_LANGUAGE_ID,
            newExerciseData.nameEn,
            newExerciseData.descriptionEn,
        );

        // For each entry in alternative names, create a new alias
        for (const alias of newExerciseData.alternativeNamesEn) {
            await postAlias(exerciseId, alias);
        }

        // Post the images
        for (const image of newExerciseData.images) {
            await postExerciseImage(baseId, image.file);
        }

        // Create the translation if needed
        if (newExerciseData.languageId !== null) {
            await addExerciseTranslation(
                baseId,
                newExerciseData.languageId,
                newExerciseData.nameTranslation,
                newExerciseData.descriptionTranslation,
            );
        }


        console.log("Exercise created");
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
                        onClick={submitExercise}
                        sx={{ mt: 1, mr: 1 }}
                    >
                        {t("exercises.submitExercise")}
                    </Button>
                    <Button disabled={false} onClick={onBack} sx={{ mt: 1, mr: 1 }}>
                        {t("goBack")}
                    </Button>
                </div>
            </Box>
        </div>
    );
};
