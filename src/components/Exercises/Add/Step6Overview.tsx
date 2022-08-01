import { Box, Button, ImageListItem, Table, TableCell, TableContainer, TableRow, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { StepProps } from "components/Exercises/Add/AddExerciseStepper";
import { addExerciseBase, addExerciseTranslation, postAlias, postExerciseImage } from "services";
import { ENGLISH_LANGUAGE_ID } from "utils/consts";
import { addVariation } from "services/variation";
import { useNavigate } from "react-router-dom";
import { useCategoriesQuery, useEquipmentQuery, useLanguageQuery, useMusclesQuery } from "components/Exercises/queries";
import { getTranslationKey } from "utils/strings";
import ImageList from "@mui/material/ImageList";
import { LoadingPlaceholder } from "components/Exercises/ExerciseOverview";


export const Step6Overview = ({
                                  newExerciseData,
                                  onBack,
                              }: StepProps) => {
    const [t] = useTranslation();
    const navigate = useNavigate();
    const categoryQuery = useCategoriesQuery();
    const languageQuery = useLanguageQuery();
    const musclesQuery = useMusclesQuery();
    const equipmentQuery = useEquipmentQuery();

    const submitExercise = async () => {
        // Create a new variation object if needed
        // TODO: PATCH the other exercise base (newVariationBaseId) with the new variation id
        let variationId;
        if (newExerciseData.newVariationBaseId !== null) {
            variationId = await addVariation();
        } else {
            variationId = newExerciseData.variationId;
        }

        // Create the base
        const baseId = await addExerciseBase(
            newExerciseData.category as number,
            newExerciseData.equipment,
            newExerciseData.muscles,
            newExerciseData.musclesSecondary,
            variationId,
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
        navigate(`../${baseId}`);
    };

    return equipmentQuery.isLoading || languageQuery.isLoading || musclesQuery.isLoading || languageQuery.isLoading ?
        <LoadingPlaceholder /> : (
            <>
                <Typography variant={"h6"}>
                    {t('exercises.step1HeaderBasics')}
                </Typography>
                <TableContainer>
                    <Table>
                        <TableRow>
                            <TableCell>{t('name')}</TableCell>
                            <TableCell>{newExerciseData!.nameEn}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>{t('exercises.alternativeNames')}</TableCell>
                            <TableCell>{newExerciseData!.alternativeNamesEn.join(", ")}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>{t('description')}</TableCell>
                            <TableCell>{newExerciseData!.descriptionEn}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>{t('category')}</TableCell>
                            <TableCell>{t(getTranslationKey(categoryQuery.data!.find(c => c.id === newExerciseData!.category)!.name))}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>{t('exercises.equipment')}</TableCell>
                            <TableCell>{newExerciseData!.equipment.map(e => t(getTranslationKey(equipmentQuery.data!.find(value => value.id === e)!.name))).join(', ')}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>{t('exercises.muscles')}</TableCell>
                            <TableCell>{newExerciseData!.muscles.map(m => musclesQuery.data!.find(value => value.id === m)!.getName(t)).join(', ')}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>{t('exercises.secondaryMuscles')}</TableCell>
                            <TableCell>{newExerciseData!.musclesSecondary.map(m => musclesQuery.data!.find(value => value.id === m)!.getName(t)).join(', ')}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>{t('exercises.variations')}</TableCell>
                            <TableCell>{newExerciseData!.variationId} / {newExerciseData!.newVariationBaseId}</TableCell>
                        </TableRow>
                    </Table>
                </TableContainer>
                {newExerciseData!.images.length > 0 && (
                    <ImageList
                        cols={3}
                        style={{ maxHeight: "200px", }}>
                        {newExerciseData!.images.map(imageEntry => (
                            <ImageListItem key={imageEntry.url}>
                                <img
                                    style={{ maxHeight: "200px", maxWidth: "200px" }}
                                    src={imageEntry.url}
                                    alt=""
                                    loading="lazy"
                                />
                            </ImageListItem>
                        ))}
                    </ImageList>
                )}


                {newExerciseData!.languageId !== null && (
                    <>
                        <Typography variant={"h6"} sx={{ mt: 3 }}>
                            {languageQuery.data!.find(l => l.id === newExerciseData!.languageId)!.nameLong}
                        </Typography>
                        <TableContainer>
                            <Table>
                                <TableRow>
                                    <TableCell>{t('name')}</TableCell>
                                    <TableCell>
                                        {newExerciseData!.nameEn}
                                    </TableCell>
                                </TableRow>

                                <TableRow>
                                    <TableCell>{t('exercises.alternativeNames')}</TableCell>
                                    <TableCell>{newExerciseData!.alternativeNamesTranslation.join(", ")}</TableCell>
                                </TableRow>


                                <TableRow>
                                    <TableCell>{t('description')}</TableCell>
                                    <TableCell>{newExerciseData!.descriptionTranslation}</TableCell>
                                </TableRow>
                            </Table>
                        </TableContainer>
                    </>
                )}


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
            </>
        );
};
