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
import { FormQueryErrors } from "components/Core/Widgets/FormError";
import { StepProps } from "components/Exercises/Add/AddExerciseStepper";
import {
    useAddExerciseFullQuery,
    useCategoriesQuery,
    useEquipmentQuery,
    useLanguageQuery,
    useMusclesQuery
} from "components/Exercises/queries";
import { useProfileQuery } from "components/User/queries/profile";
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { postExerciseImage } from "services";
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

    const addExerciseSubmissionMutation = useAddExerciseFullQuery();

    const submitExercise = async () => {

        // TODO: handle variations properly
        const variationId: number | null = state.variationId;
        // if (state.newVariationExerciseId !== null) {
        //     ...
        // } else {
        //     ....
        // }
        // Create the exercise
        const exerciseId = await addExerciseSubmissionMutation.mutateAsync({
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
                    comments: [
                        ...state.notesEn.map(name => ({ comment: name }))
                    ]
                },
                ...(state.languageId !== null ? [{
                    language: state.languageId,
                    name: state.nameI18n,
                    description: state.descriptionI18n,
                    aliases: [
                        ...state.alternativeNamesI18n.map(name => ({ alias: name }))
                    ],
                    comments: [
                        ...state.notesI18n.map(name => ({ comment: name }))
                    ]
                }] : [])
            ],
        });

        // Post the images individually, it seems to be more reliable this way
        // and most problems were happening when creating the exercise itself
        for (const image of state.images) {
            await postExerciseImage({
                exerciseId: exerciseId,
                image: image.file,
                imageData: image,
            });
        }
        
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

            <Box sx={{ mt: 2 }}>
                {addExerciseSubmissionMutation.isIdle && <Alert severity="info">
                    {t('exercises.checkInformationBeforeSubmitting')}
                </Alert>}

                {addExerciseSubmissionMutation.isSuccess && <Alert severity="success">
                    <AlertTitle>{t('success')}</AlertTitle>
                    {t('exercises.cacheWarning')}
                </Alert>}

                <FormQueryErrors mutationQuery={addExerciseSubmissionMutation} />
            </Box>

            <Grid container>
                <Grid display="flex" justifyContent={"end"} size={12}>
                    <Box sx={{ mb: 2 }}>
                        <div>
                            {!addExerciseSubmissionMutation.isSuccess &&
                                <Button
                                    onClick={onBack}
                                    sx={{ mt: 1, mr: 1 }}
                                >
                                    {t('goBack')}
                                </Button>
                            }
                            {!addExerciseSubmissionMutation.isSuccess
                                && <Button
                                    variant="contained"
                                    disabled={addExerciseSubmissionMutation.isError || addExerciseSubmissionMutation.isPending}
                                    onClick={submitExercise}
                                    sx={{ mt: 1, mr: 1 }}
                                    color="info"
                                >
                                    {t('exercises.submitExercise')}
                                </Button>
                            }
                            {addExerciseSubmissionMutation.isSuccess
                                && <Button
                                    variant="contained"
                                    onClick={() => navigate(makeLink(WgerLink.EXERCISE_DETAIL, i18n.language, { id: addExerciseSubmissionMutation.data! }))}
                                    sx={{ mt: 1, mr: 1 }}
                                    color="success"
                                >
                                    {t('seeDetails')}
                                    <NavigateNextIcon />
                                </Button>
                            }
                        </div>
                    </Box>
                </Grid>
            </Grid>
        </>;
};
