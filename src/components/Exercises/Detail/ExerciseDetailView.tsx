import { Box, Button, Divider, Typography } from "@mui/material";
import Grid from '@mui/material/Grid';
import { PaddingBox } from "components/Exercises/Detail/ExerciseDetails";
import { OverviewCard } from "components/Exercises/Detail/OverviewCard";
import { SideGallery, SideVideoGallery } from "components/Exercises/Detail/SideGallery";
import { Exercise } from "components/Exercises/models/exercise";
import { Language } from "components/Exercises/models/language";
import { Muscle } from "components/Exercises/models/muscle";
import { Note } from "components/Exercises/models/note";
import { MuscleOverview } from "components/Muscles/MuscleOverview";
import { useCanContributeExercises } from "components/User/queries/contribute";
import React from "react";
import { useTranslation } from "react-i18next";
import { dateTimeToLocale } from "utils/date";


const TranslateExerciseBanner = ({ setEditMode }: { setEditMode: (mode: boolean) => void }) => {
    const [t] = useTranslation();

    return (
        <Box
            mb={2}
            paddingY={2}
            sx={{
                width: "100%",
                backgroundColor: "#ebebeb",
                textAlign: "center",
            }}
        >
            <Typography variant={"h5"}>
                {t("exercises.exerciseNotTranslated")}
            </Typography>

            <Typography gutterBottom variant="body1" component="div">
                {t("exercises.exerciseNotTranslatedBody")}
            </Typography>

            <Button variant="contained" onClick={() => setEditMode(true)}>
                {t("exercises.translateExerciseNow")}
            </Button>

        </Box>
    );
};

export interface ViewProps {
    exercise: Exercise
    variations: Exercise[],
    language: Language,
    setEditMode: (mode: boolean) => void
}

export const ExerciseDetailView = ({
                                       exercise,
                                       variations,
                                       language,
                                       setEditMode
                                   }: ViewProps) => {
    const [t] = useTranslation();
    const contributeQuery = useCanContributeExercises();
    const currentTranslation = exercise.getTranslation(language);
    const isNewTranslation = language && language.id !== currentTranslation.language;

    const muscleLegendStyle = {
        height: '17px',
        width: '17px',
        display: 'inline-block',
        verticalAlign: 'middle',
        borderRadius: 4,
        opacity: 0.8,
    };

    return (
        <Grid container>
            {isNewTranslation
                && contributeQuery.canContribute
                && <Grid
                    order={{ xs: 2, sm: 1 }}
                    size={{
                        xs: 12,
                        sm: 7,
                        md: 12
                    }}>
                    <TranslateExerciseBanner setEditMode={setEditMode} />
                </Grid>
            }
            <Grid
                order={{ xs: 2, sm: 1 }}
                size={{
                    xs: 12,
                    sm: 7,
                    md: 8
                }}>

                {currentTranslation?.aliases.length > 0
                    && <>
                        <p>
                            {t("exercises.alsoKnownAs")} &nbsp;
                            {currentTranslation?.aliases?.map(e => e.alias).join(", ")}
                        </p>
                        <PaddingBox />
                    </>}

                <Typography variant="h5">{t("exercises.description")}</Typography>
                <div dangerouslySetInnerHTML={{ __html: currentTranslation?.description! }} />
                <PaddingBox />

                {currentTranslation?.notes.length > 0 && <Typography variant="h5">{t("exercises.notes")}</Typography>}
                <ul>
                    {currentTranslation?.notes.map((note: Note) => (
                        <li key={note.id}>{note.note}</li>
                    ))}
                </ul>
                <PaddingBox />

                <Typography variant="h5">{t("exercises.muscles")}</Typography>
                <Grid container>
                    <Grid
                        order={{ xs: 1 }}
                        size={{
                            xs: 6,
                            md: 3
                        }}>
                        <MuscleOverview
                            primaryMuscles={exercise.muscles}
                            secondaryMuscles={exercise.musclesSecondary}
                            isFront={true}
                        />
                    </Grid>
                    <Grid
                        order={{ xs: 2, md: 3 }}
                        size={{
                            xs: 6,
                            md: 3
                        }}>
                        <div>
                            <div style={{ ...muscleLegendStyle, backgroundColor: '#fc0000' }}></div>
                            <b style={{ marginLeft: 8, verticalAlign: 'middle' }}>
                                {t("exercises.primaryMuscles")}
                            </b>
                        </div>
                        <ul>
                            {exercise.muscles.map((m: Muscle) => (
                                <li key={m.id}>{m.getName()}</li>
                            ))}
                        </ul>
                    </Grid>

                    <Grid
                        order={{ xs: 3, md: 2 }}
                        size={{
                            xs: 6,
                            md: 3
                        }}>
                        <MuscleOverview
                            primaryMuscles={exercise.muscles}
                            secondaryMuscles={exercise.musclesSecondary}
                            isFront={false}
                        />
                    </Grid>


                    <Grid
                        order={{ xs: 4 }}
                        size={{
                            xs: 6,
                            md: 3
                        }}>
                        <div>
                            <div style={{ ...muscleLegendStyle, backgroundColor: '#f57900' }}></div>
                            <b style={{ marginLeft: 8, verticalAlign: 'middle' }}>
                                {t("exercises.secondaryMuscles")}
                            </b>
                        </div>

                        <ul>
                            {exercise.musclesSecondary.map((m: Muscle) => (
                                <li key={m.id}>{m.getName()}</li>
                            ))}
                        </ul>
                    </Grid>

                </Grid>
                <PaddingBox />
            </Grid>
            <Grid
                order={{ xs: 1, sm: 2 }}
                size={{
                    xs: 12,
                    sm: 5,
                    md: 4
                }}>
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
                <Box sx={{ pl: 1 }}>
                    <SideGallery
                        mainImage={exercise.mainImage}
                        sideImages={exercise.sideImages}
                    />
                    <PaddingBox />
                    <SideVideoGallery videos={exercise.videos} />
                </Box>
            </Grid>


            <Grid order={{ xs: 3 }} size={12}>

                <PaddingBox />

                {variations.length > 0 && <Typography variant={"h5"}>{t('exercises.variations')}</Typography>}
                <Grid container spacing={2}>
                    {variations.map((variation: Exercise) =>
                        <Grid
                            key={variation.id}
                            size={{
                                xs: 6,
                                md: 2
                            }}>
                            <OverviewCard
                                key={variation.id}
                                exercise={variation}
                                language={language}
                            />
                        </Grid>
                    )}
                </Grid>
            </Grid>
            <Grid order={{ xs: 4, }} sx={{ mt: 3 }} size={12}>

                <Divider />
                <Typography
                    variant="caption"
                    display="block"
                    mt={1}
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                    <i className="fa-brands fa-creative-commons" style={{ fontSize: 20 }}></i>
                    The content on this page is available under the
                    <a href="https://creativecommons.org/licenses/by-sa/4.0/deed">
                        CC BY-SA 4 License
                    </a>.
                </Typography>

                <Typography
                    variant="caption"
                    display="block" mt={1}
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                    <>
                        Authors: {exercise.authors.join(", ")}<br />
                        Last update: {dateTimeToLocale(exercise.lastUpdateGlobal)}
                    </>
                </Typography>
            </Grid>
        </Grid>
    );
};
