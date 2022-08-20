import React, {useState} from "react";
import {Head} from "./Head";
import {SideGallery} from "./SideGallery";
import {useNavigate, useParams} from "react-router-dom";
import {getExerciseBase, getExerciseBasesForVariation, getLanguageByShortName,} from "services";
import {useTranslation} from "react-i18next";
import {ExerciseTranslation} from "components/Exercises/models/exerciseTranslation";
import {Language} from "components/Exercises/models/language";
import {OverviewCard} from "components/Exercises/Detail/OverviewCard";
import {Note} from "components/Exercises/models/note";
import {Muscle} from "components/Exercises/models/muscle";
import {useQuery} from "@tanstack/react-query";
import {QUERY_EXERCISE_BASES_VARIATIONS, QUERY_EXERCISE_DETAIL,} from "utils/consts";
import {useLanguageQuery} from "components/Exercises/queries";
import {Box, Container, Divider, Grid, Typography} from "@mui/material";
import {MuscleOverview} from "components/Muscles/MuscleOverview";
import {ExerciseBase} from "components/Exercises/models/exerciseBase";

export const PaddingBox = () => {
    return <Box sx={{height: 40}} />;
};

export const ExerciseDetails = () => {
    const [language, setLanguage] = useState<Language>();
    const [currentTranslation, setCurrentTranslation] = useState<ExerciseTranslation>();
    const [editMode, setEditMode] = useState<boolean>();

    const params = useParams<{ baseID: string }>();
    const exerciseBaseID = params.baseID ? parseInt(params.baseID) : 0;

    // used to detect language from browser
    const [t, i18n] = useTranslation();

    // to redirect to 404
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
        {enabled: exerciseQuery.isSuccess}
    );

    if (
        exerciseQuery.isError ||
        languageQuery.isError ||
        variationsQuery.isError
    ) {
        navigate("/not-found");
        return null;
    }

    const description =
        currentTranslation?.description !== undefined
            ? currentTranslation?.description
            : " ";
    const notes = currentTranslation?.notes;
    const aliases = currentTranslation?.aliases;

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

    return (
        <>
            {exerciseQuery.isSuccess && languageQuery.isSuccess ? (
                <Head
                    exercise={exerciseQuery.data}
                    languages={languageQuery.data}
                    availableLanguages={exerciseQuery.data!.availableLanguages}
                    changeLanguage={changeUserLanguage}
                    language={language}
                    currentTranslation={currentTranslation}
                    setEditMode={setEditMode}
                />
            ) : null}
            <PaddingBox />
            <Container maxWidth="lg">
                <Grid container>
                    <Grid item xs={12} sm={7} md={8} order={{xs: 2, sm: 1}}>
                        {aliases && aliases.length > 0 ? (
                            <div>
                                <p>
                                    {t("exercises.alsoKnownAs")} &nbsp;
                                    {aliases?.map(e => e.alias).join(", ")}
                                </p>
                                <PaddingBox />
                            </div>) : null}

                        <div>
                            <Typography variant="h5">{t("exercises.description")}</Typography>
                            <div dangerouslySetInnerHTML={{__html: description}} />
                            <PaddingBox />
                        </div>

                        <div>
                            <Typography variant="h5">{t("exercises.notes")}</Typography>
                            {notes?.map((note: Note) => (
                                <li key={note.id}>{note.note}</li>
                            ))}
                            <PaddingBox />
                        </div>

                        <Typography variant="h5">{t("exercises.muscles")}</Typography>
                        <Grid container>
                            <Grid item xs={6} md={3} order={{xs: 1}}>
                                <MuscleOverview
                                    primaryMuscles={exerciseQuery.isSuccess ? exerciseQuery.data!.muscles : []}
                                    secondaryMuscles={exerciseQuery.isSuccess ? exerciseQuery.data!.musclesSecondary : []}
                                    isFront={true} />
                            </Grid>
                            <Grid item xs={6} md={3} order={{xs: 2, md: 3}}>
                                <h3>{t("exercises.primaryMuscles")}</h3>
                                <ul>
                                    {exerciseQuery.data?.muscles.map((m: Muscle) => (
                                        <li key={m.id}>{m.getName(t)}</li>
                                    ))}
                                </ul>
                            </Grid>

                            <Grid item xs={6} md={3} order={{xs: 3, md: 2}}>
                                <MuscleOverview
                                    primaryMuscles={exerciseQuery.isSuccess ? exerciseQuery.data!.muscles : []}
                                    secondaryMuscles={exerciseQuery.isSuccess ? exerciseQuery.data!.musclesSecondary : []}
                                    isFront={false} />
                            </Grid>


                            <Grid item xs={6} md={3} order={{xs: 4}}>
                                <h3>{t("exercises.secondaryMuscles")}</h3>
                                <ul>
                                    {exerciseQuery.data?.musclesSecondary.map((m: Muscle) => (
                                        <li key={m.id}>{m.getName(t)}</li>
                                    ))}
                                </ul>
                            </Grid>

                        </Grid>
                        <PaddingBox />
                    </Grid>
                    <Grid item xs={12} sm={5} md={4} order={{xs: 1, sm: 2}}>
                        { /*
                        <Carousel>
                            <CarouselItem>
                                <img
                                    style={{width: "100%"}}
                                    src="https://images.unsplash.com/photo-1434682881908-b43d0467b798?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1174&q=80"
                                    alt="detail"
                                />
                            </CarouselItem>
                            <CarouselItem>
                                <img
                                    style={{width: "100%"}}
                                    src="https://images.unsplash.com/photo-1434682881908-b43d0467b798?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1174&q=80"
                                    alt="detail"
                                />
                            </CarouselItem>
                            <CarouselItem>
                                <img
                                    style={{width: "100%"}}
                                    src="https://images.unsplash.com/photo-1434682881908-b43d0467b798?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1174&q=80"
                                    alt="detail"
                                />
                            </CarouselItem>
                        </Carousel>
                        */}

                        {/* This gallery only displays on medium screens upwards */}
                        {exerciseQuery.isSuccess && (
                            <SideGallery
                                mainImage={exerciseQuery.data.mainImage}
                                sideImages={exerciseQuery.data.sideImages}
                            />
                        )}
                    </Grid>

                    <Grid item xs={12} order={{xs: 3}}>

                        <Divider />
                        <PaddingBox />

                        <Typography variant={"h5"}>{t('exercises.variations')}</Typography>
                        <Grid container spacing={2}>
                            {variations.map((variation: ExerciseBase) =>
                                <Grid item xs={12} md={2} key={variation.id}>
                                    <OverviewCard
                                        key={variation.id}
                                        exerciseBase={variation}
                                        language={language}
                                    />
                                </Grid>
                            )}
                        </Grid>
                    </Grid>
                    <Grid item xs={12} order={{xs: 4}}>
                        <Typography variant="caption" display="block" mt={2}>
                            The text on this page is available under the <a
                            href="components/Exercises/Detail/ExerciseDetails.tsx">CC BY-SA 4
                            License</a>.
                        </Typography>
                    </Grid>
                </Grid>
            </Container>
        </>
    );
};
