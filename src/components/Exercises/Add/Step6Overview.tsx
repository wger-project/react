import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import {
    Alert,
    AlertTitle,
    Box,
    Button,
    ImageListItem,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    Typography
} from "@mui/material";
import Grid from '@mui/material/Grid2';
import ImageList from "@mui/material/ImageList";
import { LoadingPlaceholder } from "components/Core/LoadingWidget/LoadingWidget";
import { StepProps } from "components/Exercises/Add/AddExerciseStepper";
import { Note } from "components/Exercises/models/note";
import { useCategoriesQuery, useEquipmentQuery, useLanguageQuery, useMusclesQuery } from "components/Exercises/queries";
import { useProfileQuery } from "components/User/queries/profile";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { addExercise, addTranslation, postAlias, postExerciseImage } from "services";
import { addNote } from "services/note";
import { addVariation } from "services/variation";
import { useExerciseSubmissionStateValue } from "state";
import { ENGLISH_LANGUAGE_ID } from "utils/consts";
import { getTranslationKey } from "utils/strings";
import { makeLink, WgerLink } from "utils/url";

export const Step6Overview = ({ onBack }: StepProps) => {
    const [t, i18n] = useTranslation();
    const [state] = useExerciseSubmissionStateValue();

    const navigate = useNavigate();
    const categoryQuery = useCategoriesQuery();
    const languageQuery = useLanguageQuery();
    const musclesQuery = useMusclesQuery();
    const equipmentQuery = useEquipmentQuery();
    const profileQuery = useProfileQuery();

    // This could be handled better and more cleanly...
    type submissionStatus = 'initial' | 'loading' | 'done';
    const [submissionState, setSubmissionState] = useState<submissionStatus>('initial',);

    const submitExercise = async () => {

        setSubmissionState('loading');

        // Create a new variation object if needed
        // TODO: PATCH the other exercise base (newVariationExerciseId) with the new variation id
        let variationId;
        if (state.newVariationExerciseId !== null) {
            variationId = await addVariation();
        } else {
            variationId = state.variationId;
        }

        // Create the exercise
        const exerciseId = await addExercise(
            state.category as number,
            state.equipment,
            state.muscles,
            state.musclesSecondary,
            variationId,
            profileQuery.data!.username
        );

        // Create the English translation
        const translation = await addTranslation({
            exerciseId: exerciseId,
            languageId: ENGLISH_LANGUAGE_ID,
            name: state.nameEn,
            description: state.descriptionEn,
            author: profileQuery.data!.username
        });

        // For each entry in alternative names, create a new alias
        for (const alias of state.alternativeNamesEn) {
            await postAlias(translation.id!, alias);
        }

        // Post the images
        for (const image of state.images) {
            await postExerciseImage({
                exerciseId: exerciseId,
                image: image.file,
                imageData: image,
            });
        }

        // Post the notes
        for (const note of state.notesEn) {
            await addNote(new Note(null, translation.id!, note));
        }


        // Create the translation if needed
        if (state.languageId !== null) {
            const exerciseI18n = await addTranslation({
                exerciseId: exerciseId,
                languageId: state.languageId,
                name: state.nameI18n,
                description: state.descriptionI18n,
                author: profileQuery.data!.username
            });

            for (const alias of state.alternativeNamesI18n) {
                await postAlias(exerciseI18n.id!, alias);
            }

            for (const note of state.notesI18n) {
                await addNote(new Note(null, exerciseI18n.id!, note));
            }
        }

        console.log("Exercise created");
        setSubmissionState('done');
    };

    const navigateToOverview = () => {
        navigate(makeLink(WgerLink.EXERCISE_OVERVIEW, i18n.language));
    };

    return equipmentQuery.isLoading || languageQuery.isLoading || musclesQuery.isLoading || categoryQuery.isLoading
        ? <LoadingPlaceholder />
        : <>
            <Typography variant={"h6"}>
                {t('exercises.step1HeaderBasics')}
            </Typography>
            <TableContainer>
                <Table>
                    <TableBody>
                        <TableRow>
                            <TableCell>{t('name')}</TableCell>
                            <TableCell>{state.nameEn}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>{t('exercises.alternativeNames')}</TableCell>
                            <TableCell>{state.alternativeNamesEn.join(", ")}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>{t('description')}</TableCell>
                            <TableCell>{state.descriptionEn}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>{t('exercises.notes')}</TableCell>
                            <TableCell>{state.notesEn.map(note => <>{note}<br /></>)}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>{t('category')}</TableCell>
                            <TableCell>{t(getTranslationKey(categoryQuery.data!.find(c => c.id === state.category)!.name))}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>{t('exercises.equipment')}</TableCell>
                            <TableCell>{state.equipment.map(e => t(getTranslationKey(equipmentQuery.data!.find(value => value.id === e)!.name))).join(', ')}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>{t('exercises.muscles')}</TableCell>
                            <TableCell>{state.muscles.map(m => musclesQuery.data!.find(value => value.id === m)!.getName(t)).join(', ')}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>{t('exercises.secondaryMuscles')}</TableCell>
                            <TableCell>{state.musclesSecondary.map(m => musclesQuery.data!.find(value => value.id === m)!.getName(t)).join(', ')}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>{t('exercises.variations')}</TableCell>
                            <TableCell>{state.variationId} / {state.newVariationExerciseId}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
            {state.images.length > 0 && (
                <ImageList
                    cols={3}
                    style={{ maxHeight: "200px", }}>
                    {state.images.map(imageEntry => (
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


            {state.languageId !== null && (
                <>
                    <Typography variant={"h6"} sx={{ mt: 3 }}>
                        {languageQuery.data!.find(l => l.id === state.languageId)!.nameLong}
                    </Typography>
                    <TableContainer>
                        <Table>
                            <TableBody>
                                <TableRow>
                                    <TableCell>{t('name')}</TableCell>
                                    <TableCell>
                                        {state.nameI18n}
                                    </TableCell>
                                </TableRow>

                                <TableRow>
                                    <TableCell>{t('exercises.alternativeNames')}</TableCell>
                                    <TableCell>{state.alternativeNamesI18n.join(", ")}</TableCell>
                                </TableRow>


                                <TableRow>
                                    <TableCell>{t('description')}</TableCell>
                                    <TableCell>{state.descriptionI18n}</TableCell>
                                </TableRow>


                                <TableRow>
                                    <TableCell>{t('exercises.notes')}</TableCell>
                                    <TableCell>{state.notesI18n.map(note => <>{note}<br /></>)}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </>
            )}

            {!(submissionState === 'done')
                ? <Alert severity="info" sx={{ mt: 2 }}>
                    {t('exercises.checkInformationBeforeSubmitting')}
                </Alert>
                : <Alert severity="success" sx={{ mt: 2 }}>
                    <AlertTitle>{t('success')}</AlertTitle>
                    {t('exercises.cacheWarning')}
                </Alert>
            }

            <Grid container>
                <Grid display="flex" justifyContent={"end"} size={12}>
                    <Box sx={{ mb: 2 }}>
                        <div>
                            {submissionState !== 'done' &&
                                <Button
                                    onClick={onBack}
                                    sx={{ mt: 1, mr: 1 }}
                                >
                                    {t('goBack')}
                                </Button>
                            }
                            {submissionState !== 'done'
                                && <Button
                                    variant="contained"
                                    disabled={submissionState !== 'initial'}
                                    onClick={submitExercise}
                                    sx={{ mt: 1, mr: 1 }}
                                    color="info"
                                >
                                    {t('exercises.submitExercise')}
                                </Button>
                            }
                            {submissionState === 'done'
                                && <Button
                                    variant="contained"
                                    onClick={navigateToOverview}
                                    sx={{ mt: 1, mr: 1 }}
                                    color="success"
                                >
                                    {t('overview')}
                                    <NavigateNextIcon />
                                </Button>
                            }
                        </div>
                    </Box>
                </Grid>
            </Grid>
        </>;
};
