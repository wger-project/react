import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import { Alert, Box, Button, IconButton, InputAdornment, TextField, Typography } from "@mui/material";
import Grid from '@mui/material/Grid';
import { MarkdownEditor } from "components/Common/forms/MarkdownEditor";
import { LoadingWidget } from "components/Core/LoadingWidget/LoadingWidget";
import { FormQueryErrorsSnackbar } from 'components/Core/Widgets/FormError';
import { PaddingBox } from "components/Exercises/Detail/ExerciseDetails";
import { EditExerciseCategory } from "components/Exercises/forms/Category";
import { EditExerciseEquipment } from "components/Exercises/forms/Equipment";
import { ExerciseAliases } from "components/Exercises/forms/ExerciseAliases";
import { ExerciseName } from "components/Exercises/forms/ExerciseName";
import { AddImageCard, ImageEditCard } from "components/Exercises/forms/ImageCard";
import { EditExerciseMuscle } from "components/Exercises/forms/Muscle";
import { EditExerciseVariation } from "components/Exercises/forms/Variation";
import { AddVideoCard, VideoEditCard } from "components/Exercises/forms/VideoCard";
import {
    alternativeNameValidator,
    descriptionValidator,
    nameValidator
} from "components/Exercises/forms/yupValidators";
import { Language } from "components/Exercises/models/language";
import { Note } from "components/Exercises/models/note";
import { Translation } from "components/Exercises/models/translation";
import {
    useAddNoteQuery,
    useAddTranslationQuery,
    useDeleteNoteQuery,
    useEditExerciseImageQuery,
    useEditNoteQuery,
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
import { ImageFormModal } from '../forms/ImageModal';
import { ImageFormData } from '../models/exercise';
import { ExerciseImage, ImageStyle } from '../models/image';

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

    const [openModal, setOpenModal] = React.useState(false);
    const [imageGuardError, setImageGuardError] = useState<string | null>(null);

    const [selectedImage, setSelectedImage] = useState<ImageFormData | null>(null);
    const [editingImageId, setEditingImageId] = useState<number | null>(null);

    const editImageMutation = useEditExerciseImageQuery(exerciseId);
    const addNoteMutation = useAddNoteQuery(exerciseId);
    const editNoteMutation = useEditNoteQuery(exerciseId);
    const deleteNoteMutation = useDeleteNoteQuery(exerciseId);

    const [newNoteValue, setNewNoteValue] = useState('');
    const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
    const [editingNoteValue, setEditingNoteValue] = useState('');

    useEffect(() => {
        if (exerciseQuery.data !== undefined) {
            setMainMuscles(exerciseQuery.data.muscles.map((m) => m.id));
            setSecondaryMuscles(exerciseQuery.data.musclesSecondary.map((m) => m.id));
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
            ? new Translation({ id: null, uuid: null, name: '', description: '', language: language.id })
            : translationFromBase;
    const exerciseEnglish = exercise.getTranslation();

    const validationSchema = yup.object({
        name: nameValidator(),
        alternativeNames: alternativeNameValidator(),
        description: descriptionValidator()
    });

    // Called when clicking "Edit" on an existing card
    // Inside handleEditClick in ExerciseDetailEdit.tsx
    const handleEditClick = (image: ExerciseImage) => {
        setSelectedImage({
            url: image.url,
            file: undefined,
            title: image.title || '',
            author: image.author || '',
            authorUrl: image.authorUrl || '',
            objectUrl: image.objectUrl || '',
            derivativeSourceUrl: image.derivativeSourceUrl || '',
            style: image.style || ImageStyle.PHOTO,
        });
        setEditingImageId(image.id);
        setOpenModal(true);
        setImageGuardError(null);
    };

    const handleSaveImage = async (values: ImageFormData) => {
        if (!editingImageId) {
            setImageGuardError('Could not edit image: missing image id.');
            return;
        }

        await editImageMutation.mutateAsync({
            imageId: editingImageId,
            image: values.file, // This will be undefined if they didn't pick a new file
            imageData: values
        });

        setOpenModal(false);
        setEditingImageId(null);
        setSelectedImage(null);
        setImageGuardError(null);
    };

    return <>
        <Formik
            initialValues={{
                name: exerciseTranslation.name,
                alternativeNames: exerciseTranslation.aliases.map(a => ({ id: a.id, alias: a.alias })),
                description: exerciseTranslation.descriptionSource,
            }}
            enableReinitialize
            validationSchema={validationSchema}
            onSubmit={async values => {

                // Exercise translation
                const payload = {
                    exerciseId: exercise.id!,
                    languageId: language.id,
                    name: values.name,
                    descriptionSource: values.description,
                    author: ''
                };

                const translation = exerciseTranslation.id
                    ? await editTranslationQuery.mutateAsync({ ...payload, id: exerciseTranslation.id })
                    : await addTranslationQuery.mutateAsync({ ...payload, author: profileQuery.data!.username });

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
            {({ values, touched, errors, setFieldValue }) => (
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
                            <Box sx={{ mb: 2 }}>
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
                            {/* English/Base Description (Read Only) */}
                            <Typography variant="h6" gutterBottom>English Description (Reference)</Typography>
                            <div dangerouslySetInnerHTML={{ __html: exerciseEnglish.description || '' }} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            {/* Markdown Editor */}
                            <MarkdownEditor
                                value={values.description}
                                onChange={(val) => setFieldValue('description', val)}
                                error={touched.description && Boolean(errors.description)}
                                // FIXED: Use ternary to ensure we return undefined instead of false
                                helperText={touched.description ? errors.description : undefined}
                            />
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
                            <Grid size={12}>
                                <PaddingBox />
                                <Typography variant={'h5'}>{t('exercises.variations')}</Typography>
                            </Grid>
                            <Grid size={12}>
                                <EditExerciseVariation exerciseId={exercise.id!} initial={exercise.variationGroup} />
                            </Grid>
                        </>}

                        <Grid size={12}>
                            <PaddingBox />
                        </Grid>

                        <Grid size={12}>
                            <Typography variant={'h6'}>{t('exercises.notes')}</Typography>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <ul>
                                {exerciseEnglish.notes.map((note: Note) => (
                                    <li key={note.id}>{note.note}</li>
                                ))}
                            </ul>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            {exerciseTranslation.notes.map((note: Note) => (
                                <TextField
                                    key={note.id}
                                    fullWidth
                                    value={editingNoteId === note.id ? editingNoteValue : note.note}
                                    onChange={(e) => {
                                        if (editingNoteId !== note.id) {
                                            setEditingNoteId(note.id);
                                            setEditingNoteValue(e.target.value);
                                        } else {
                                            setEditingNoteValue(e.target.value);
                                        }
                                    }}
                                    onFocus={() => {
                                        if (editingNoteId !== note.id) {
                                            setEditingNoteId(note.id);
                                            setEditingNoteValue(note.note);
                                        }
                                    }}
                                    sx={{ mb: 1 }}
                                    variant="standard"
                                    slotProps={{
                                        input: {
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    {editingNoteId === note.id && editingNoteValue !== note.note && (
                                                        <IconButton
                                                            onClick={async () => {
                                                                await editNoteMutation.mutateAsync(
                                                                    new Note(note.id, note.translation, editingNoteValue)
                                                                );
                                                                setEditingNoteId(null);
                                                                setEditingNoteValue('');
                                                            }}
                                                            disabled={editNoteMutation.isPending}
                                                        >
                                                            <SaveIcon />
                                                        </IconButton>
                                                    )}
                                                    <IconButton
                                                        onClick={() => deleteNoteMutation.mutate(note.id!)}
                                                        disabled={deleteNoteMutation.isPending}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }
                                    }}
                                />
                            ))}
                            {exerciseTranslation.id && (
                                <TextField
                                    fullWidth
                                    label={t('exercises.newNote')}
                                    variant="standard"
                                    value={newNoteValue}
                                    onChange={(e) => setNewNoteValue(e.target.value)}
                                    helperText={t('exercises.notesHelpText')}
                                    slotProps={{
                                        input: {
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        onClick={async () => {
                                                            if (newNoteValue.trim()) {
                                                                await addNoteMutation.mutateAsync(
                                                                    new Note(null, exerciseTranslation.id!, newNoteValue)
                                                                );
                                                                setNewNoteValue('');
                                                            }
                                                        }}
                                                        disabled={addNoteMutation.isPending || !newNoteValue.trim()}
                                                    >
                                                        <AddIcon />
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }
                                    }}
                                />
                            )}
                        </Grid>

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
            )}
        </Formik>

        {/* Images */}
        <PaddingBox />
        <Typography variant={'h5'}>{t('images')}</Typography>
        <Grid container spacing={2} sx={{ mt: 2 }}>
            {addImagePermissionQuery.data && <Grid key={'add'} size={{ md: 3 }}>
                <AddImageCard exerciseId={exercise.id!} />
            </Grid>}

            {exercise.images.map(img => (
                <Grid key={img.id} size={{ md: 3 }}>
                    <ImageEditCard
                        exerciseId={exercise.id!}
                        image={img}
                        canDelete={deleteImagePermissionQuery.data!}
                        onEdit={handleEditClick}
                    />
                </Grid>
            ))}
        </Grid>

        {/* Videos */}
        <PaddingBox />
        <Typography variant={'h5'}>{t('videos')}</Typography>
        <Grid container spacing={2} sx={{ mt: 2 }}>
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
                <Grid container spacing={1} sx={{ mt: 2 }}>
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
                            <Grid sx={{ display: "flex", justifyContent: "center" }} size={6}>
                                <MuscleOverview
                                    primaryMuscles={mainMuscles.map(m => musclesQuery.data!.find(mq => mq.id === m)!)}
                                    secondaryMuscles={secondaryMuscles.map(m => musclesQuery.data!.find(mq => mq.id === m)!)}
                                    isFront={true}
                                />
                            </Grid>
                            <Grid sx={{ display: "flex", justifyContent: "center" }} size={6}>
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

        <ImageFormModal
            open={openModal}
            onClose={() => setOpenModal(false)}
            image={selectedImage}
            onSubmit={handleSaveImage}
            submitLabel={t('save')}
        />

        {editImageMutation.isError && (
            <FormQueryErrorsSnackbar mutationQuery={editImageMutation} />
        )}

        {imageGuardError && (
            <FormQueryErrorsSnackbar
                mutationQuery={{
                    isError: true,
                    error: { message: imageGuardError, response: { data: null } }
                }}
            />
        )}
    </>;
};