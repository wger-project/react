import React, {useState} from "react";
import styles from "./exerciseDetails.module.css";
import {Head} from "./Head";
import {Carousel, CarouselItem} from "components/Carousel";
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
import {Stack, Typography} from "@mui/material";
import {MuscleOverview} from "components/Muscles/MuscleOverview";
import {ExerciseBase} from "components/Exercises/models/exerciseBase";

export const ExerciseDetails = () => {
    const [language, setLanguage] = useState<Language>();
    const [currentTranslation, setCurrentTranslation] = useState<ExerciseTranslation>();

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
        const newTranslatedExercise = exerciseQuery.data?.getTranslation(lang);
        setCurrentTranslation(newTranslatedExercise);
    };

    const variations = variationsQuery.isSuccess
        ? variationsQuery.data!.filter((b) => b.id !== exerciseBaseID).map(variantExercise => {
            return (
                <OverviewCard
                    key={variantExercise.id}
                    exerciseBase={variantExercise}
                    language={language}
                />
            );
        })
        : [];

    return (
        <div className={styles.root}>
            {exerciseQuery.isSuccess && languageQuery.isSuccess ? (
                <Head
                    exercise={exerciseQuery.data}
                    languages={languageQuery.data}
                    availableLanguages={exerciseQuery.data!.availableLanguages}
                    changeLanguage={changeUserLanguage}
                    language={language}
                    currentTranslation={currentTranslation}
                />
            ) : null}
            <div className={styles.body}>

                {aliases && aliases.length > 0 ? (
                    <div className={styles.detail_alt_name}>
                        <p>
                            {t("exercises.alsoKnownAs")} &nbsp;
                            {aliases?.map(e => e.alias).join(", ")}
                        </p>
                    </div>) : null}

                <section className={styles.hero}>
                    <aside>
                        {/* This carousel only displays on small screens */}
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

                        {/* This gallery only displays on medium screens upwards */}
                        {exerciseQuery.isSuccess && (
                            <SideGallery
                                mainImage={exerciseQuery.data.mainImage}
                                sideImages={exerciseQuery.data.sideImages}
                            />
                        )}
                    </aside>
                    <section>
                        <article>
                            <div>
                                <h1>{t("exercises.description")}</h1>
                                <div dangerouslySetInnerHTML={{__html: description}}/>
                            </div>

                            <div>
                                <h1>{t("exercises.notes")}</h1>

                                {notes?.map((note: Note) => (
                                    <li key={note.id}>{note.note}</li>
                                ))}
                            </div>

                            <h1>{t("exercises.muscles")}</h1>
                            <Stack direction={"row"}>
                                <MuscleOverview
                                    primaryMuscles={exerciseQuery.isSuccess ? exerciseQuery.data!.muscles : []}
                                    secondaryMuscles={exerciseQuery.isSuccess ? exerciseQuery.data!.musclesSecondary : []}
                                    isFront={true}/>
                                <MuscleOverview
                                    primaryMuscles={exerciseQuery.isSuccess ? exerciseQuery.data!.muscles : []}
                                    secondaryMuscles={exerciseQuery.isSuccess ? exerciseQuery.data!.musclesSecondary : []}
                                    isFront={false}/>
                                <div>
                                    <div className={styles.details_detail_card}>
                                        <h3>{t("exercises.primaryMuscles")}</h3>
                                        <ul>
                                            {exerciseQuery.data?.muscles.map((m: Muscle) => (
                                                <li key={m.id}>{m.getName(t)}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className={styles.details_detail_card}>
                                        <h3>{t("exercises.secondaryMuscles")}</h3>
                                        <ul>
                                            {exerciseQuery.data?.musclesSecondary.map((m: Muscle) => (
                                                <li key={m.id}>{m.getName(t)}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </Stack>
                        </article>
                    </section>
                </section>

                <hr className={styles.line_break}/>

                <article>
                    <div className={styles.variants}>
                        <h1>{t('exercises.variations')}</h1>
                        <div className={styles.cards}>{variantExercises}</div>
                    </div>
                </article>

                <Typography variant="caption" display="block" mt={2}>
                    The text on this page is available under the
                    <a href="components/Exercises/Detail/ExerciseDetails.tsx">CC BY-SA 4 License</a>.
                </Typography>
            </div>

            { /** <Footer /> **/}
        </div>
    );
};
