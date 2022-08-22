import { useTranslation } from "react-i18next";
import { Button, Divider, Grid, Typography } from "@mui/material";
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
import { editExerciseTranslation } from "services/exerciseTranslation";
import { ExerciseDescription } from "components/Exercises/forms/ExerciseDescription";

export interface ViewProps {
    exercise: ExerciseBase
    variations: ExerciseBase[],
    language: Language
}

export const ExerciseDetailEditTranslation = ({
                                                  exercise,
                                                  variations,
                                                  language
                                              }: ViewProps) => {
    const [t] = useTranslation();

    const exerciseTranslation = exercise.getTranslation(language);
    const exerciseEnglish = exercise.getTranslation();

    const validationSchema = yup.object({
        name: nameValidator(t),
        alternativeNames: alternativeNameValidator(t),
        description: descriptionValidator(t)
    });

    return <Formik
        initialValues={{
            name: exerciseTranslation.name,
            alternativeNames: exerciseTranslation.aliases.map(a => a.alias),
            description: exerciseTranslation.description,
        }}
        validationSchema={validationSchema}
        onSubmit={async values => {

            // Edit exercise translation
            await editExerciseTranslation(
                exerciseTranslation.id,
                exercise.id!,
                exerciseTranslation.language,
                values.name,
                values.description,
            );
        }}
    >
        <Form>
            <Grid container>
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
                <Grid item xs={12}>
                    <PaddingBox />
                </Grid>


                {/*
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
                    <Divider />
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
    </Formik>;
};
