import { useTranslation } from "react-i18next";
import { Alert, Button, Grid, IconButton, Typography } from "@mui/material";
import React from "react";
import { ExerciseBase } from "components/Exercises/models/exerciseBase";
import { Language } from "components/Exercises/models/language";
import { PaddingBox } from "components/Exercises/Detail/ExerciseDetails";
import * as yup from "yup";
import {
    alternativeNameValidator,
    descriptionValidator,
    nameValidator
} from "components/Exercises/forms/yupValidators";
import { Form, Formik } from "formik";
import { ExerciseName } from "components/Exercises/forms/ExerciseName";
import { ExerciseAliases } from "components/Exercises/forms/ExerciseAliases";
import { ExerciseDescription } from "components/Exercises/forms/ExerciseDescription";
import { addExerciseTranslation, deleteAlias, editExerciseTranslation, postAlias } from "services";
import { ExerciseTranslation } from "components/Exercises/models/exerciseTranslation";
import CloseIcon from '@mui/icons-material/Close';
import { usePermissionQuery } from "components/User/queries";
import { WgerPermissions } from "permissions";
import { AddImageCard, ImageEditCard } from "components/Exercises/forms/ImageCard";

export interface ViewProps {
    exercise: ExerciseBase;
    language: Language;
}

export const ExerciseDetailEdit = ({
                                       exercise,
                                       language
                                   }: ViewProps) => {
    const [t] = useTranslation();

    const [alertIsVisible, setAlertIsVisible] = React.useState(false);
    const translationFromBase = exercise.getTranslation(language);
    const isNewTranslation = language.id !== translationFromBase.language;
    const exerciseTranslation =
        isNewTranslation
            ? new ExerciseTranslation(null, null, '', '', language.id)
            : translationFromBase;
    const exerciseEnglish = exercise.getTranslation();

    const deleteImagePermissionQuery = usePermissionQuery(WgerPermissions.DELETE_IMAGE);

    const validationSchema = yup.object({
        name: nameValidator(t),
        alternativeNames: alternativeNameValidator(t),
        description: descriptionValidator(t)
    });

    return <>
        <Formik
            initialValues={{
                name: exerciseTranslation.name,
                alternativeNames: exerciseTranslation.aliases.map(a => a.alias),
                description: exerciseTranslation.description,
            }}
            enableReinitialize
            validationSchema={validationSchema}
            onSubmit={async values => {

                // Exercise translation
                const translation = exerciseTranslation.id
                    ? await editExerciseTranslation(
                        exerciseTranslation.id,
                        exercise.id!,
                        exerciseTranslation.language,
                        values.name,
                        values.description,
                    )
                    : await addExerciseTranslation(
                        exercise.id!,
                        language.id,
                        values.name,
                        values.description
                    );

                // Edit aliases (this is currently really hacky)
                // Since we only get the string from the form, we need to compare them to the list of
                // current aliases and decide which stay the same and which will be updated (which we
                // can't directly do, so the old one gets deleted and a new one created)

                // https://stackoverflow.com/questions/1187518/
                const aliasOrig = exerciseTranslation.aliases.map(a => a.alias);
                const aliasNew = values.alternativeNames;
                const aliasToCreate = aliasNew.filter(x => !aliasOrig.includes(x));
                let aliasToDelete = aliasOrig.filter(x => !aliasNew.includes(x));

                aliasToCreate.forEach(alias => {
                    postAlias(translation.id!, alias);
                });

                aliasToDelete.forEach(alias => {
                    deleteAlias(exerciseTranslation.aliases.find(a => a.alias === alias)!.id);
                });

                // Notify the user
                setAlertIsVisible(true);
            }}
        >
            <Form>
                <Grid container>
                    {alertIsVisible &&
                        <Grid item xs={12}>
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

                    <Grid item xs={6}>
                        <Typography variant={'h5'}>{t('English')}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant={'h5'}>
                            {language.nameLong} ({language.nameShort})
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <PaddingBox />
                        <Typography variant={'h6'}>{t('name')}</Typography>
                    </Grid>
                    <Grid item sm={6}>
                        {exerciseEnglish.name}
                        <ul>
                            {exerciseEnglish.aliases.map((alias) => (
                                <li key={alias.id}>{alias.alias}</li>
                            ))}
                        </ul>
                    </Grid>
                    <Grid item sm={6}>
                        <ExerciseName fieldName={'name'} />
                        <ExerciseAliases fieldName={'alternativeNames'} />
                    </Grid>
                    <Grid item xs={12}>
                        <PaddingBox />
                    </Grid>


                    <Grid item xs={12}>
                        <Typography variant={'h6'}>{t('exercises.description')}</Typography>
                    </Grid>
                    <Grid item sm={6}>
                        <div dangerouslySetInnerHTML={{ __html: exerciseEnglish.description! }} />
                    </Grid>
                    <Grid item sm={6}>
                        <ExerciseDescription fieldName={"description"} />
                    </Grid>

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
                <Grid item xs={12}>
                    <Divider />
                    <PaddingBox />
                </Grid>
                <Grid item xs={12}>
                    <Typography variant={'h6'}>{t('exercises.muscles')}</Typography>
                </Grid>
                <Grid item sm={6}>
                    <ul>
                        {exercise.muscles.map((m) => (
                            <li key={m.id}>{m.getName(t)}</li>
                        ))}
                    </ul>
                </Grid>
                <Grid item sm={6}>
                    <ul>
                        {exercise.musclesSecondary.map((m) => (
                            <li key={m.id}>{m.getName(t)}</li>
                        ))}
                    </ul>
                </Grid>

                */}


                    <Grid item xs={12}>
                        <PaddingBox />
                        <Button
                            variant="contained"
                            type="submit"
                            sx={{ mt: 1, mr: 1 }}
                        >
                            {t('save')}
                        </Button>
                    </Grid>
                </Grid>
            </Form>
        </Formik>

        {/* Images */}
        {deleteImagePermissionQuery.isSuccess
            && deleteImagePermissionQuery.data
            && <Grid container spacing={2} mt={2}>
                {exercise.images.map(img => (
                    <Grid item md={3} key={img.id}>
                        <ImageEditCard image={img} />
                    </Grid>
                ))}
                <Grid item md={3} key={'add'}>
                    <AddImageCard baseId={exercise.id!} />
                </Grid>
            </Grid>
        }
    </>;
};
