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
import Grid from '@mui/material/Grid';
import ImageList from "@mui/material/ImageList";
import { LoadingPlaceholder } from "components/Core/LoadingWidget/LoadingWidget";
import { StepProps } from "components/Exercises/Add/AddExerciseStepper";
import { useCategoriesQuery, useEquipmentQuery, useLanguageQuery, useMusclesQuery } from "components/Exercises/queries";
import { useProfileQuery } from "components/User/queries/profile";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { addFullExercise } from "services";
import { useExerciseSubmissionStateValue } from "state";
import { ENGLISH_LANGUAGE_ID } from "utils/consts";
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

        // TODO: handle variations properly
        const variationId: number | null = state.variationId;
        // if (state.newVariationExerciseId !== null) {
        //     ...
        // } else {
        //     ....
        // }

        // Create the exercise
        await addFullExercise({
            exercise: {
                categoryId: state.category as number,
                equipmentIds: state.equipment,
                muscleIds: state.muscles,
                secondaryMuscleIds: state.musclesSecondary,
            },
            author: profileQuery.data!.username,
            variation: variationId,
            translations: [
                {
                    language: ENGLISH_LANGUAGE_ID,
                    name: state.nameEn,
                    description: state.descriptionEn,
                    aliases: [
                        ...state.alternativeNamesEn.map(name => ({ alias: name }))
                    ],
                    notes: [
                        ...state.notesEn.map(name => ({ note: name }))
                    ]
                },
                ...(state.languageId !== null ? [{
                    language: state.languageId,
                    name: state.nameI18n,
                    description: state.descriptionI18n,
                    aliases: [
                        ...state.alternativeNamesI18n.map(name => ({ alias: name }))
                    ],
                    notes: [
                        ...state.notesI18n.map(name => ({ note: name }))
                    ]
                }] : [])
            ]
        });

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
                            <TableCell>{categoryQuery.data!.find(c => c.id === state.category)!.translatedName}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>{t('exercises.equipment')}</TableCell>
                            <TableCell>{state.equipment.map(e => equipmentQuery.data!.find(value => value.id === e)!.translatedName).join(', ')}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>{t('exercises.muscles')}</TableCell>
                            <TableCell>{state.muscles.map(m => musclesQuery.data!.find(value => value.id === m)!.getName()).join(', ')}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>{t('exercises.secondaryMuscles')}</TableCell>
                            <TableCell>{state.musclesSecondary.map(m => musclesQuery.data!.find(value => value.id === m)!.getName()).join(', ')}</TableCell>
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
