import React from "react";
import { Box, Card, CardContent, CardMedia, Grid, Skeleton, } from "@mui/material";
import { ExerciseBase } from "components/Exercises/models/exerciseBase";
import { OverviewCard } from "components/Exercises/Detail/OverviewCard";
import { useTranslation } from "react-i18next";
import { getLanguageByShortName } from "services";
import { Language } from "components/Exercises/models/language";
import { useLanguageQuery } from "components/Exercises/queries";

type ExerciseGridProps = {
    exerciseBases: ExerciseBase[];
    isLoading: boolean;
};

export const ExerciseGrid = ({ exerciseBases, isLoading }: ExerciseGridProps) => {

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

    const loadingSkeleton = isLoading && languageQuery.isSuccess
        ? Array.apply(null, Array(21)).map((skeletonBase, idx) => (
            <Grid item xs={4} key={idx} sx={{ display: "flex" }}>
                <Card>
                    <CardMedia>
                        <Skeleton variant="rectangular" width={250} height={150} />
                    </CardMedia>
                    <CardContent>
                        <Box sx={{ pt: 0.5 }}>
                            <Skeleton width="60%" />
                            <Skeleton />
                        </Box>
                    </CardContent>
                </Card>
            </Grid>
        ))
        : exerciseBases.map(b => (
            <Grid item xs={6} md={4} key={b.id} sx={{ display: "flex" }}>
                <OverviewCard exerciseBase={b} language={currentUserLanguage} />
            </Grid>
        ));

    return (
        <Grid container spacing={1}>
            {loadingSkeleton}
        </Grid>
    );
};
