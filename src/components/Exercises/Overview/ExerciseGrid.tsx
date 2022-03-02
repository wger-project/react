import React from 'react';
import { Grid } from "@mui/material";
import { ExerciseBase } from "components/Exercises/models/exerciseBase";
import { OverviewCard } from "components/Exercises/Detail/OverviewCard";
import { useExerciseStateValue } from "state";
import { useTranslation } from "react-i18next";
import { getLanguageByShortName } from "services/language";

type ExerciseGridProps = {
    exerciseBases: ExerciseBase[];
}

export const ExerciseGrid = ({ exerciseBases }: ExerciseGridProps) => {

    const [state] = useExerciseStateValue();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [t, i18n] = useTranslation();
    const currentUserLanguage = getLanguageByShortName(i18n.language, state.languages);


    return (
        <Grid container spacing={1}>
            {exerciseBases.map(b => (<Grid item xs={4} key={b.id} sx={{ display: 'flex' }}>
                <OverviewCard exerciseBase={b} language={currentUserLanguage} />
            </Grid>))}
        </Grid>
    );
};