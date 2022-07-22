import React, { useState } from "react";
import styles from "./exerciseDetails.module.css";
import { Head } from "./Head";
import { Carousel, CarouselItem } from "components/Carousel";
import { SideGallery } from "./SideGallery";
import { Footer } from "components";
import { useNavigate, useParams } from "react-router-dom";
import { getExerciseBase, getExerciseBasesForVariation, getLanguageByShortName, } from "services";
import { ExerciseBase } from "components/Exercises/models/exerciseBase";
import { useTranslation } from "react-i18next";
import { ExerciseTranslation } from "components/Exercises/models/exerciseTranslation";
import { Language } from "components/Exercises/models/language";
import { OverviewCard } from "components/Exercises/Detail/OverviewCard";
import { Note } from "components/Exercises/models/note";
import { Muscle } from "components/Exercises/models/muscle";
import { useQuery } from "react-query";
import { QUERY_EXERCISE_BASES_VARIATIONS, QUERY_EXERCISE_DETAIL, } from "utils/consts";
import { useLanguageQuery } from "components/Exercises/queries";
import { Typography } from "@mui/material";

export const ExerciseDetails = () => {
    const [currentLanguage, setCurrentLanguage] = useState<Language>();
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
        async () => await getExerciseBase(exerciseBaseID),
        {
            enabled: languageQuery.isSuccess,
            onSuccess: (data: ExerciseBase) => {
                const currentUserLanguage = getLanguageByShortName(
                    i18n.language,
                    languageQuery.data!
                );
                // get exercise translation from received exercise and set it
                if (currentUserLanguage) {
                    const newTranslatedExercise = data?.getTranslation(currentUserLanguage);
                    setCurrentTranslation(newTranslatedExercise);
                }
                setCurrentLanguage(currentUserLanguage);
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
        setCurrentLanguage(language);
        const newTranslatedExercise = exerciseQuery.data?.getTranslation(lang);
        setCurrentTranslation(newTranslatedExercise);
    };

    const variantExercises = variationsQuery.isSuccess
        ? variationsQuery.data!.map(variantExercise => {
            return (
                <OverviewCard
                    key={variantExercise.id}
                    exerciseBase={variantExercise}
                    language={currentLanguage}
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
                    changeLanguage={changeUserLanguage}
                    language={currentLanguage}
                    currentTranslation={currentTranslation}
                />
            ) : null}
            <div className={styles.body}>

                {aliases && aliases.length > 0 ? (
                    <div className={styles.detail_alt_name}>
                        <p>
                            {t("exercises.also-known-as")} &nbsp;
                            {aliases?.map(e => e.alias).join(", ")}
                        </p>
                    </div>) : null}

                <section className={styles.hero}>
                    <aside>
                        {/* This carousel only displays on small screens */}
                        <Carousel>
                            <CarouselItem>
                                <img
                                    style={{ width: "100%" }}
                                    src="https://images.unsplash.com/photo-1434682881908-b43d0467b798?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1174&q=80"
                                    alt="detail"
                                />
                            </CarouselItem>
                            <CarouselItem>
                                <img
                                    style={{ width: "100%" }}
                                    src="https://images.unsplash.com/photo-1434682881908-b43d0467b798?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1174&q=80"
                                    alt="detail"
                                />
                            </CarouselItem>
                            <CarouselItem>
                                <img
                                    style={{ width: "100%" }}
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
                                <div dangerouslySetInnerHTML={{ __html: description }} />
                            </div>

                            <div>
                                <h1>{t("exercises.notes")}</h1>

                                {notes?.map((note: Note) => (
                                    <li key={note.id}>{note.note}</li>
                                ))}
                            </div>

                            <h1>{t("exercises.muscles")}</h1>
                            <div className={styles.details}>
                                <div className={styles.details_image}>
                                    <img
                                        src="https://images.unsplash.com/photo-1434682881908-b43d0467b798?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1174&q=80"
                                        alt="detail"
                                    />
                                </div>
                                <div className={styles.details_details}>
                                    <div className={styles.details_detail_card}>
                                        <h3>{t("exercises.primaryMuscles")}</h3>
                                        <ul>
                                            {exerciseQuery.data?.muscles.map((m: Muscle) => (
                                                <li key={m.id}>{m.name}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className={styles.details_detail_card}>
                                        <h3>{t("exercises.secondaryMuscles")}</h3>
                                        <ul>
                                            {exerciseQuery.data?.musclesSecondary.map((m: Muscle) => (
                                                <li key={m.id}>{m.name}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </article>
                    </section>
                </section>

                <hr className={styles.line_break} />

                <article>
                    <div className={styles.variants}>
                        <h1>Variants</h1>

                        <div className={styles.cards}>{variantExercises}</div>
                    </div>
                </article>

                <Typography variant="caption" display="block" mt={2}>
                    The text on this page is available under the
                    <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4 License</a>.
                </Typography>
            </div>

            <Footer />
        </div>
    );
};
