import { Box, Container } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { LoadingWidget } from "components/Core/LoadingWidget/LoadingWidget";
import { ExerciseDetailEdit } from "components/Exercises/Detail/ExerciseDetailEdit";
import { ExerciseDetailView } from "components/Exercises/Detail/ExerciseDetailView";
import { Exercise } from "components/Exercises/models/exercise";
import { Language } from "components/Exercises/models/language";
import { Translation } from "components/Exercises/models/translation";
import { useLanguageQuery } from "components/Exercises/queries";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { getExerciseBase, getExerciseBasesForVariation, getLanguageByShortName, } from "services";
import { QUERY_EXERCISE_BASES_VARIATIONS, QUERY_EXERCISE_DETAIL, } from "utils/consts";
import { Head } from "./Head";

export const PaddingBox = () => {
    return <Box sx={{ height: 40 }} />;
};

export const ExerciseDetails = () => {
    const [language, setLanguage] = useState<Language>();
    const [currentTranslation, setCurrentTranslation] = useState<Translation>();
    const [editMode, setEditMode] = useState<boolean>(false);

    const params = useParams<{ baseID: string }>();
    const exerciseBaseID = params.baseID ? parseInt(params.baseID) : 0;

    const { i18n } = useTranslation();
    const navigate = useNavigate();

    const languageQuery = useLanguageQuery();
    const exerciseQuery = useQuery(
        [QUERY_EXERCISE_DETAIL, exerciseBaseID],
        () => getExerciseBase(exerciseBaseID),
        {
            enabled: languageQuery.isSuccess,
            onSuccess: (exerciseBase: Exercise) => {
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
        out = editMode
            ? <ExerciseDetailEdit
                exercise={exerciseQuery.data}
                language={language!} />
            : <ExerciseDetailView
                exercise={exerciseQuery.data}
                language={language!}
                variations={variations}
                setEditMode={setEditMode} />;
    }

    return (
        <>
            {
                exerciseQuery.isSuccess
                && languageQuery.isSuccess
                && <Container>
                    <Head
                        exercise={exerciseQuery.data}
                        languages={languageQuery.data}
                        changeLanguage={changeUserLanguage}
                        language={language}
                        setEditMode={setEditMode}
                        editMode={editMode} />
                </Container>
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
