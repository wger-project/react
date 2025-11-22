import CloseIcon from '@mui/icons-material/Close';
import { Alert, Box, Button, IconButton, Typography } from "@mui/material";
import Grid from '@mui/material/Grid';
import { LoadingWidget } from "components/Core/LoadingWidget/LoadingWidget";
import { PaddingBox } from "components/Exercises/Detail/ExerciseDetails";
import { EditExerciseCategory } from "components/Exercises/forms/Category";
import { EditExerciseEquipment } from "components/Exercises/forms/Equipment";
import { ExerciseAliases } from "components/Exercises/forms/ExerciseAliases";
import { ExerciseDescription } from "components/Exercises/forms/ExerciseDescription";
import { ExerciseName } from "components/Exercises/forms/ExerciseName";
import { AddImageCard, ImageEditCard } from "components/Exercises/forms/ImageCard";
import { EditExerciseMuscle } from "components/Exercises/forms/Muscle";
import { AddVideoCard, VideoEditCard } from "components/Exercises/forms/VideoCard";
import {
    alternativeNameValidator,
    descriptionValidator,
    nameValidator
} from "components/Exercises/forms/yupValidators";
import { Language } from "components/Exercises/models/language";
import { Translation } from "components/Exercises/models/translation";
import {
    useAddTranslationQuery,
    useEditTranslationQuery,
    useExerciseQuery,
    useMusclesQuery
} from "components/Exercises/queries";
import { MuscleOverview } from "components/Muscles/MuscleOverview";
import { usePermissionQuery } from "components/User/queries/permission";
import { useProfileQuery } from "components/User/queries/profile";
import { Form, Formik } from "formik";
import { WgerPermissions } from "permissions";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { deleteAlias, postAlias } from "services";
import * as yup from "yup";

export interface ViewProps {
    exerciseId: number;
    language: Language;
}

export const ExerciseDetailEdit = ({ exerciseId, language }: ViewProps) => {
    const [t] = useTranslation();

    const [alertIsVisible, setAlertIsVisible] = useState(false);
    const [mainMuscles, setMainMuscles] = useState<number[]>([]);
    const [secondaryMuscles, setSecondaryMuscles] = useState<number[]>([]);

    const exerciseQuery = useExerciseQuery(exerciseId);
    const addTranslationQuery = useAddTranslationQuery(exerciseId);
    const editTranslationQuery = useEditTranslationQuery(exerciseId);
    const addImagePermissionQuery = usePermissionQuery(WgerPermissions.ADD_IMAGE);
    const deleteImagePermissionQuery = usePermissionQuery(WgerPermissions.DELETE_IMAGE);
    const addVideoPermissionQuery = usePermissionQuery(WgerPermissions.ADD_VIDEO);
    const deleteVideoPermissionQuery = usePermissionQuery(WgerPermissions.DELETE_VIDEO);
    const editExercisePermissionQuery = usePermissionQuery(WgerPermissions.EDIT_EXERCISE);
    const musclesQuery = useMusclesQuery();
    const profileQuery = useProfileQuery();

    const exercise = exerciseQuery.data!;

    useEffect(() => {
        if (exerciseQuery.data !== undefined) {
            setMainMuscles(exercise.muscles.map((m) => m.id));
            setSecondaryMuscles(exercise.musclesSecondary.map((m) => m.id));
        }
    }, [exerciseQuery.data]);


    if (
        exerciseQuery.isLoading
        || musclesQuery.isLoading
        || exerciseQuery.isLoading
        || profileQuery.isLoading
        || addImagePermissionQuery.isLoading
        || deleteImagePermissionQuery.isLoading
        || addVideoPermissionQuery.isLoading
        || deleteVideoPermissionQuery.isLoading
        || editExercisePermissionQuery.isLoading
    ) {
        return <LoadingWidget />;
    }

    const translationFromBase = exercise.getTranslation(language);
    const isNewTranslation = language.id !== translationFromBase?.language;
    const exerciseTranslation =
        isNewTranslation
            ? new Translation(null, null, '', '', language.id)
            : translationFromBase;
    const exerciseEnglish = exercise.getTranslation();

    const validationSchema = yup.object({
        name: nameValidator(),
        alternativeNames: alternativeNameValidator(),
        description: descriptionValidator()
    });

    return <>
        <Formik
            initialValues={{
                name: exerciseTranslation.name,
                alternativeNames: exerciseTranslation.aliases.map(a => ({ id: a.id, alias: a.alias })),
                description: exerciseTranslation.description,
            }}
            enableReinitialize
            validationSchema={validationSchema}
            onSubmit={async values => {

                // Exercise translation
                const translation = exerciseTranslation.id
                    ? await editTranslationQuery.mutateAsync({
                        id: exerciseTranslation.id,
                        exerciseId: exercise.id!,
                        languageId: language.id,
                        name: values.name,
                        description: values.description,
                        author: ''
                    })
                    : await addTranslationQuery.mutateAsync({
                        exerciseId: exercise.id!,
                        languageId: language.id,
                        name: values.name,
                        description: values.description,
                        author: profileQuery.data!.username
                    });

                // Alias handling
                const aliasOrig = (exerciseTranslation.aliases).map(a => ({ id: a.id, alias: a.alias }));
                const aliasNew = values.alternativeNames ?? [];

                const aliasToCreate = aliasNew.filter(n => !aliasOrig.some(o => o.alias === n.alias));
                const aliasToDelete = aliasOrig.filter(o => !aliasNew.some(n => n.alias === o.alias));

                // Create new aliases
                for (const a of aliasToCreate) {
                    await postAlias(translation.id!, a.alias);
                }

                // Delete removed aliases
                for (const a of aliasToDelete) {
                    if (a.id) {
                        await deleteAlias(a.id);
                    }
                }

                // Notify the user
                setAlertIsVisible(true);
            }}
        >
            <Form>
                <Grid container spacing={1}>
                    {alertIsVisible &&
                        <Grid size={12}>
                            <Alert
                                severity="success"
                                action={
                                    <IconButton
                                        aria-label="close"
                                        size="small"
                                        color="inherit"
                                        onClick={() => {
                                            setAlertIsVisible(false);
                                        }}
                                    >
                                        <CloseIcon fontSize="inherit" />
                                    </IconButton>
                                }
                            >
                                {t('exercises.successfullyUpdated')}
                            </Alert>
                            <PaddingBox />
                        </Grid>}

                    <Grid size={12}>
                        <Typography variant={'h5'}>{t('translation')}</Typography>
                    </Grid>
                    <Grid size={6}>
                        <Typography variant={'h6'}>{t('English')}</Typography>
                    </Grid>
                    <Grid size={6}>
                        <Typography variant={'h6'}>
                            {language.nameLong} ({language.nameShort})
                        </Typography>
                    </Grid>
                    <Grid size={12}>
                        <PaddingBox />
                        <Typography variant={'h6'}>{t('name')}</Typography>
                    </Grid>
                    <Grid size={6}>
                        {exerciseEnglish.name}
                        <ul>
                            {exerciseEnglish.aliases.map((alias) => (
                                <li key={alias.id}>{alias.alias}</li>
                            ))}
                        </ul>
                    </Grid>
                    <Grid size={6}>
                        <Box mb={2}>
                            <ExerciseName fieldName={'name'} />
                        </Box>
                        <ExerciseAliases fieldName={'alternativeNames'} />
                    </Grid>
                    <Grid size={12}>
                        <PaddingBox />
                    </Grid>


                    <Grid size={12}>
                        <Typography variant={'h6'}>{t('exercises.description')}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <div dangerouslySetInnerHTML={{ __html: exerciseEnglish.description! }} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <ExerciseDescription fieldName={"description"} />
                    </Grid>

                    {editExercisePermissionQuery.data && <>
                        <Grid size={12}>
                            <PaddingBox />
                        </Grid>
                        <Grid size={12}>
                            <Typography variant={'h5'}>{t('nutrition.others')}</Typography>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <EditExerciseCategory exerciseId={exercise.id!} initial={exercise.category.id} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <EditExerciseEquipment exerciseId={exercise.id!}
                                                   initial={exercise.equipment.map(e => e.id)} />
                        </Grid>
                    </>}

                    {/*
                <Grid item xs={12}>
                    <PaddingBox />
                </Grid>

                <Grid item xs={12}>
                    <Typography variant={'h6'}>{t('exercises.notes')}</Typography>
                </Grid>
                <Grid item sm={6}>
                    <ul>
                        {exerciseEnglish.notes.map((note: Note) => (
                            <li key={note.id}>{note.note}</li>
                        ))}
                    </ul>
                </Grid>
                <Grid item sm={6}>
                    <ul>
                        {exerciseTranslation.notes.map((note: Note) => (
                            <li key={note.id}>{note.note}</li>
                        ))}
                    </ul>
                </Grid>
                */}

                    <Grid size={12}>
                        <PaddingBox />
                        <Button
                            variant="contained"
                            type="submit"
                            sx={{ mt: 1, mr: 1 }}
                            disabled={exerciseQuery.isLoading || addTranslationQuery.isPending || editTranslationQuery.isPending}
                        >
                            {t('save')}
                        </Button>
                    </Grid>
                </Grid>
            </Form>
        </Formik>

        {/* Images */}
        <PaddingBox />
        <Typography variant={'h5'}>{t('images')}</Typography>
        <Grid container spacing={2} mt={2}>
            {addImagePermissionQuery.data && <Grid key={'add'} size={{ md: 3 }}>
                <AddImageCard exerciseId={exercise.id!} />
            </Grid>}

            {exercise.images.map(img => (
                <Grid key={img.id} size={{ md: 3 }}>
                    <ImageEditCard
                        exerciseId={exercise.id!}
                        image={img}
                        canDelete={deleteImagePermissionQuery.data!}
                    />
                </Grid>
            ))}
        </Grid>

        {/* Videos */}
        <PaddingBox />
        <Typography variant={'h5'}>{t('videos')}</Typography>
        <Grid container spacing={2} mt={2}>
            {addVideoPermissionQuery.data
                && <Grid key={'add'} size={{ md: 3 }}>
                    <AddVideoCard exerciseId={exercise.id!} />
                </Grid>
            }

            {exercise.videos.map(video => (
                <Grid key={video.id} size={{ md: 3 }}>
                    <VideoEditCard exerciseId={exercise.id!} video={video}
                                   canDelete={deleteVideoPermissionQuery.data!} />
                </Grid>
            ))}
        </Grid>

        {/* Base data */}
        {editExercisePermissionQuery.data
            && <>
                <PaddingBox />
                <Typography variant={'h5'}>{t('exercises.muscles')}</Typography>
                <Grid container spacing={1} mt={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <EditExerciseMuscle
                            exerciseId={exercise.id!}
                            value={mainMuscles}
                            setValue={setMainMuscles}
                            blocked={secondaryMuscles}
                            isMain
                        />
                        <Box sx={{ mt: 2 }} />
                        <EditExerciseMuscle
                            exerciseId={exercise.id!}
                            value={secondaryMuscles}
                            setValue={setSecondaryMuscles}
                            blocked={mainMuscles}
                            isMain={false}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Grid container>
                            <Grid display="flex" justifyContent={"center"} size={6}>
                                <MuscleOverview
                                    primaryMuscles={mainMuscles.map(m => musclesQuery.data!.find(mq => mq.id === m)!)}
                                    secondaryMuscles={secondaryMuscles.map(m => musclesQuery.data!.find(mq => mq.id === m)!)}
                                    isFront={true}
                                />
                            </Grid>
                            <Grid display="flex" justifyContent={"center"} size={6}>
                                <MuscleOverview
                                    primaryMuscles={mainMuscles.map(m => musclesQuery.data!.find(mq => mq.id === m)!)}
                                    secondaryMuscles={secondaryMuscles.map(m => musclesQuery.data!.find(mq => mq.id === m)!)}
                                    isFront={false}
                                />
                            </Grid>
                        </Grid>
                    </Grid>

                </Grid>
            </>
        }
    </>;
};
