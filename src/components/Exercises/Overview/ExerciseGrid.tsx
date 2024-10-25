import Grid from '@mui/material/Grid2';
import { OverviewCard } from "components/Exercises/Detail/OverviewCard";
import { Exercise } from "components/Exercises/models/exercise";
import { Language } from "components/Exercises/models/language";
import { useLanguageQuery } from "components/Exercises/queries";
import React from "react";
import { useTranslation } from "react-i18next";
import { getLanguageByShortName } from "services";

type ExerciseGridProps = {
    exercises: Exercise[];
};

export const ExerciseGrid = ({ exercises }: ExerciseGridProps) => {

    const languageQuery = useLanguageQuery();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [t, i18n] = useTranslation();

    let currentUserLanguage: Language | undefined;
    if (languageQuery.isSuccess) {
        currentUserLanguage = getLanguageByShortName(
            i18n.language,
            languageQuery.data
        );
    }

    return (
        (<Grid container spacing={1}>
            {exercises.map(b => (
                <Grid
                    key={b.id}
                    sx={{ display: "flex" }}
                    size={{
                        xs: 6,
                        md: 4
                    }}>
                    <OverviewCard exercise={b} language={currentUserLanguage} />
                </Grid>
            ))}
        </Grid>)
    );
};
