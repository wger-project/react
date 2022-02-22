import React from 'react';
import { ImageList, ImageListItem } from "@mui/material";
import { ExerciseBase } from "components/Exercises/models/exerciseBase";
import { OverviewCard } from "components/Exercises/Detail/OverviewCard";
import { useExerciseStateValue } from "state";
import { useTranslation } from "react-i18next";
import { getLanguageByShortName } from "services/language";

type ExerciseGridProps = {
    exerciseBases: ExerciseBase[];
}

export const ExerciseGrid = ({ exerciseBases }: ExerciseGridProps) => {

    const [state, dispatch] = useExerciseStateValue();
    const [t, i18n] = useTranslation();

    const currentUserLanguage = getLanguageByShortName(i18n.language, state.languages);

    return (
        <ImageList cols={3}>
            {exerciseBases.map(b => (<ImageListItem key={b.id} sx={{ m: 1 }}>
                <OverviewCard exerciseBase={b} language={currentUserLanguage} />
            </ImageListItem>))}
        </ImageList>
    );
};