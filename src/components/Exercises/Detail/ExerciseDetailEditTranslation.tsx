import {useTranslation} from "react-i18next";
import {Divider, Grid, Typography} from "@mui/material";
import React from "react";
import {ExerciseBase} from "components/Exercises/models/exerciseBase";
import {Language} from "components/Exercises/models/language";
import {PaddingBox} from "components/Exercises/Detail/ExerciseDetails";
import {Note} from "components/Exercises/models/note";


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
    const [t, i18n] = useTranslation();

    const exerciseTranslation = exercise.getTranslation(language);
    const exerciseEnglish = exercise.getTranslation();


    return <>
        <Grid item xs={6}>
            <Typography variant={'h5'}>{t('English')}</Typography>
        </Grid>
        <Grid item xs={6}>
            <Typography variant={'h5'}>{language.nameLong} ({language.nameShort})</Typography>
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
            {exerciseTranslation.name}
            <ul>
                {exerciseTranslation.aliases.map((alias) => (
                    <li key={alias.id}>{alias.alias}</li>
                ))}
            </ul>
        </Grid>
        <Grid item xs={12}>
            <Divider />
            <PaddingBox />
        </Grid>


        <Grid item xs={12}>
            <Typography variant={'h6'}>{t('exercises.description')}</Typography>
        </Grid>
        <Grid item sm={6}>
            {exerciseEnglish.description}
        </Grid>
        <Grid item sm={6}>
            {exerciseTranslation.description}
        </Grid>
        <Grid item xs={12}>
            <Divider />
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
        <Grid item xs={12}>
            <Divider />
            <PaddingBox />
        </Grid>
    </>;
};
