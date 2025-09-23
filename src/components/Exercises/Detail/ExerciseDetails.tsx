import { Box, Container } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { LoadingWidget } from "components/Core/LoadingWidget/LoadingWidget";
import { ExerciseDetailEdit } from "components/Exercises/Detail/ExerciseDetailEdit";
import { ExerciseDetailView } from "components/Exercises/Detail/ExerciseDetailView";
import { Language } from "components/Exercises/models/language";
import { useLanguageQuery } from "components/Exercises/queries";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { getExercise, getExercisesForVariation, getLanguageByShortName, } from "services";
import { ENGLISH_LANGUAGE_OBJ, QUERY_EXERCISE_DETAIL, QUERY_EXERCISE_VARIATIONS, } from "utils/consts";
import { Head } from "./Head";

export const PaddingBox = () => {
    return <Box sx={{ height: 20 }} />;
};

export const ExerciseDetails = () => {
    const [language, setLanguage] = useState<Language>(ENGLISH_LANGUAGE_OBJ);
    const [editMode, setEditMode] = useState<boolean>(false);
    const { i18n } = useTranslation();
    const navigate = useNavigate();
    const languageQuery = useLanguageQuery();

    const params = useParams<{ exerciseId: string }>();
    const exerciseId = parseInt(params.exerciseId ?? '');
    if (Number.isNaN(exerciseId)) {
        return <p>Please pass an integer as the exercise id.</p>;
    }


    // eslint-disable-next-line react-hooks/rules-of-hooks
    const exerciseQuery = useQuery({
        queryKey: [QUERY_EXERCISE_DETAIL, exerciseId],
        queryFn: () => getExercise(exerciseId),
        enabled: languageQuery.isSuccess,
    });

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const variationsQuery = useQuery({
        queryKey: [QUERY_EXERCISE_VARIATIONS, exerciseQuery.data?.variationId],
        queryFn: () => getExercisesForVariation(exerciseQuery.data?.variationId),
        enabled: exerciseQuery.isSuccess
    });

    // eslint-disable-next-line react-hooks/rules-of-hooks
    React.useEffect(() => {
        if (languageQuery.data === undefined) {
            return;
        }

        // Set the currently selected language
        const currentUserLanguage = getLanguageByShortName(
            i18n.language,
            languageQuery.data!
        );
        setLanguage(currentUserLanguage!);
    }, [languageQuery.data]);

    if (exerciseQuery.isError || languageQuery.isError || variationsQuery.isError) {
        navigate("/not-found");
        return null;
    }

    const changeUserLanguage = (lang: Language) => {
        const language = getLanguageByShortName(
            lang.nameShort,
            languageQuery.data!
        );
        if (language !== undefined) {
            setLanguage(language);
        }
    };

    const variations = variationsQuery.isSuccess
        ? variationsQuery.data!.filter((b) => b.id !== exerciseId)
        : [];

    let out;
    if (exerciseQuery.isSuccess && languageQuery.isSuccess) {
        out = editMode
            ? <ExerciseDetailEdit
                exerciseId={exerciseQuery.data.id!}
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
