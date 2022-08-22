import { useTranslation } from "react-i18next";
import { Divider, Grid, Typography } from "@mui/material";
import React from "react";
import { ExerciseBase } from "components/Exercises/models/exerciseBase";
import { ExerciseTranslation } from "components/Exercises/models/exerciseTranslation";
import { Note } from "components/Exercises/models/note";
import { MuscleOverview } from "components/Muscles/MuscleOverview";
import { Muscle } from "components/Exercises/models/muscle";
import { SideGallery } from "components/Exercises/Detail/SideGallery";
import { OverviewCard } from "components/Exercises/Detail/OverviewCard";
import { Language } from "components/Exercises/models/language";
import { PaddingBox } from "components/Exercises/Detail/ExerciseDetails";


export interface ViewProps {
    exercise: ExerciseBase
    currentTranslation: ExerciseTranslation | undefined,
    variations: ExerciseBase[],
    language: Language
}

export const ExerciseDetailView = ({
                                       exercise,
                                       currentTranslation,
                                       variations,
                                       language
                                   }: ViewProps) => {
    const [t] = useTranslation();
    return <Grid container>
        <Grid item xs={12} sm={7} md={8} order={{ xs: 2, sm: 1 }}>
            {currentTranslation?.aliases && currentTranslation?.aliases.length > 0 ? (
                <div>
                    <p>
                        {t("exercises.alsoKnownAs")} &nbsp;
                        {currentTranslation?.aliases?.map(e => e.alias).join(", ")}
                    </p>
                    <PaddingBox />
                </div>) : null}

            <div>
                <Typography variant="h5">{t("exercises.description")}</Typography>
                <div
                    dangerouslySetInnerHTML={{ __html: currentTranslation?.description! }} />
                <PaddingBox />
            </div>

            <div>
                <Typography variant="h5">{t("exercises.notes")}</Typography>
                <ul>
                    {currentTranslation?.notes.map((note: Note) => (
                        <li key={note.id}>{note.note}</li>
                    ))}
                </ul>
                <PaddingBox />
            </div>

            <Typography variant="h5">{t("exercises.muscles")}</Typography>
            <Grid container>
                <Grid item xs={6} md={3} order={{ xs: 1 }}>
                    <MuscleOverview
                        primaryMuscles={exercise.muscles}
                        secondaryMuscles={exercise.musclesSecondary}
                        isFront={true} />
                </Grid>
                <Grid item xs={6} md={3} order={{ xs: 2, md: 3 }}>
                    <h3>{t("exercises.primaryMuscles")}</h3>
                    <ul>
                        {exercise.muscles.map((m: Muscle) => (
                            <li key={m.id}>{m.getName(t)}</li>
                        ))}
                    </ul>
                </Grid>

                <Grid item xs={6} md={3} order={{ xs: 3, md: 2 }}>
                    <MuscleOverview
                        primaryMuscles={exercise.muscles}
                        secondaryMuscles={exercise.musclesSecondary}
                        isFront={false} />
                </Grid>


                <Grid item xs={6} md={3} order={{ xs: 4 }}>
                    <h3>{t("exercises.secondaryMuscles")}</h3>
                    <ul>
                        {exercise.musclesSecondary.map((m: Muscle) => (
                            <li key={m.id}>{m.getName(t)}</li>
                        ))}
                    </ul>
                </Grid>

            </Grid>
            <PaddingBox />
        </Grid>
        <Grid item xs={12} sm={5} md={4} order={{ xs: 1, sm: 2 }}>
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
            <SideGallery
                mainImage={exercise.mainImage}
                sideImages={exercise.sideImages}
            />
        </Grid>

        <Grid item xs={12} order={{ xs: 3 }}>

            <Divider />
            <PaddingBox />

            <Typography variant={"h5"}>{t('exercises.variations')}</Typography>
            <Grid container spacing={2}>
                {variations.map((variation: ExerciseBase) =>
                    <Grid item xs={6} md={2} key={variation.id}>
                        <OverviewCard
                            key={variation.id}
                            exerciseBase={variation}
                            language={language}
                        />
                    </Grid>
                )}
            </Grid>
        </Grid>
        <Grid item xs={12} order={{ xs: 4 }}>
            <Typography variant="caption" display="block" mt={2}>
                The text on this page is available under the <a
                href="https://creativecommons.org/licenses/by-sa/4.0/deed">CC BY-SA 4
                License</a>.
            </Typography>
        </Grid>
    </Grid>;
};
