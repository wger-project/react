import { LoadingWidget } from "@/core/ui/LoadingWidget/LoadingWidget";
import { ExerciseDetailEdit } from "@/components/Exercises/Detail/ExerciseDetailEdit";
import { ExerciseDetailView } from "@/components/Exercises/Detail/ExerciseDetailView";
import { getLanguageByShortName, Language } from "@/components/Exercises/models/language";
import { useExerciseQuery, useExercisesForVariationQuery, useLanguageQuery, } from "@/components/Exercises/queries";
import { ENGLISH_LANGUAGE_OBJ } from "@/core/lib/consts";
import { Box, Container } from "@mui/material";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
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

    const exerciseQuery = useExerciseQuery(Number.isNaN(exerciseId) ? -1 : exerciseId);
    const variationsQuery = useExercisesForVariationQuery(exerciseQuery.data?.variationGroup);

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

    if (Number.isNaN(exerciseId)) {
        return <p>Please pass an integer as the exercise id.</p>;
    }

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
