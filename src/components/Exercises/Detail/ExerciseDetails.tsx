import React, { useState } from "react";
import { Head } from "./Head";
import { useNavigate, useParams } from "react-router-dom";
import { getExerciseBase, getExerciseBasesForVariation, getLanguageByShortName, } from "services";
import { useTranslation } from "react-i18next";
import { ExerciseTranslation } from "components/Exercises/models/exerciseTranslation";
import { Language } from "components/Exercises/models/language";
import { useQuery } from "@tanstack/react-query";
import { QUERY_EXERCISE_BASES_VARIATIONS, QUERY_EXERCISE_DETAIL, } from "utils/consts";
import { useLanguageQuery } from "components/Exercises/queries";
import { Box, Container } from "@mui/material";
import { ExerciseBase } from "components/Exercises/models/exerciseBase";
import { ExerciseDetailView } from "components/Exercises/Detail/ExerciseDetailView";
import { LoadingWidget } from "components/Core/LoadingWidget/LoadingWidget";
import { ExerciseDetailEditTranslation } from "components/Exercises/Detail/ExerciseDetailEditTranslation";


export const PaddingBox = () => {
    return <Box sx={{ height: 40 }} />;
};

export const ExerciseDetails = () => {
    const [language, setLanguage] = useState<Language>();
    const [currentTranslation, setCurrentTranslation] = useState<ExerciseTranslation>();
    const [editMode, setEditMode] = useState<boolean>(false);

    const params = useParams<{ baseID: string }>();
    const exerciseBaseID = params.baseID ? parseInt(params.baseID) : 0;

    const [t, i18n] = useTranslation();
    const navigate = useNavigate();

    const languageQuery = useLanguageQuery();
    const exerciseQuery = useQuery(
        [QUERY_EXERCISE_DETAIL, exerciseBaseID],
        () => getExerciseBase(exerciseBaseID),
        {
            enabled: languageQuery.isSuccess,
            onSuccess: (exerciseBase: ExerciseBase) => {
                const currentUserLanguage = getLanguageByShortName(
                    i18n.language,
                    languageQuery.data!
                );
                // get exercise translation from received exercise and set it
                if (currentUserLanguage) {
                    const translation = exerciseBase.getTranslation(currentUserLanguage);
                    setCurrentTranslation(translation);
                }
                setLanguage(currentUserLanguage);
            },
        }
    );

    const variationsQuery = useQuery(
        [QUERY_EXERCISE_BASES_VARIATIONS, exerciseQuery.data?.variationId],
        () => getExerciseBasesForVariation(exerciseQuery.data?.variationId),
        { enabled: exerciseQuery.isSuccess }
    );

    if (
        exerciseQuery.isError ||
        languageQuery.isError ||
        variationsQuery.isError
    ) {
        navigate("/not-found");
        return null;
    }

    const changeUserLanguage = (lang: Language) => {
        const language = getLanguageByShortName(
            lang.nameShort,
            languageQuery.data!
        );
        setLanguage(language);
        setCurrentTranslation(exerciseQuery.data?.getTranslation(lang));
    };

    const variations = variationsQuery.isSuccess
        ? variationsQuery.data!.filter((b) => b.id !== exerciseBaseID)
        : [];

    let out;
    if (exerciseQuery.isSuccess && languageQuery.isSuccess) {
        if (editMode) {
            out = <ExerciseDetailEditTranslation
                exercise={exerciseQuery.data}
                language={language!} />;
        } else {
            out = <ExerciseDetailView
                exercise={exerciseQuery.data}
                currentTranslation={currentTranslation}
                language={language!}
                variations={variations} />;
        }
    }

    return (
        <>
            {
                exerciseQuery.isSuccess
                && languageQuery.isSuccess
                && <Head
                    exercise={exerciseQuery.data}
                    languages={languageQuery.data}
                    availableLanguages={exerciseQuery.data!.availableLanguages}
                    changeLanguage={changeUserLanguage}
                    language={language}
                    currentTranslation={currentTranslation}
                    setEditMode={setEditMode}
                    editMode={editMode} />
            }
            <PaddingBox />
            <Container maxWidth="lg">
                {
                    exerciseQuery.isLoading
                    && languageQuery.isLoading
                    && <LoadingWidget />
                }
                {out}
            </Container>
        </>
    );
};
