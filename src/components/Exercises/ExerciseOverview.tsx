import AddIcon from '@mui/icons-material/Add';
import { Box, Button, Container, Pagination, Stack, Typography, useMediaQuery } from "@mui/material";
import Grid from '@mui/material/Grid';
import { CategoryFilter, CategoryFilterDropdown } from "components/Exercises/Filter/CategoryFilter";
import { EquipmentFilter, EquipmentFilterDropdown } from "components/Exercises/Filter/EquipmentFilter";
import { MuscleFilter, MuscleFilterDropdown } from "components/Exercises/Filter/MuscleFilter";
import { NameAutocompleter } from "components/Exercises/Filter/NameAutcompleter";
import { Category } from "components/Exercises/models/category";
import { Equipment } from "components/Exercises/models/equipment";
import { Muscle } from "components/Exercises/models/muscle";
import { ExerciseGrid } from "components/Exercises/Overview/ExerciseGrid";
import { ExerciseGridSkeleton } from "components/Exercises/Overview/ExerciseGridLoadingSkeleton";

import { useExercisesQuery } from "components/Exercises/queries";
import React, { useContext, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { Exercise } from "components/Exercises/models/exercise";
import { makeLink, WgerLink } from "utils/url";
import { ExerciseFiltersContext } from './Filter/ExerciseFiltersContext';
import { FilterDrawer } from './Filter/FilterDrawer';

const ContributeExerciseBanner = () => {
    const [t, i18n] = useTranslation();

    return (
        <Box
            marginTop={4}
            padding={4}
            sx={{
                width: "100%",
                backgroundColor: "#ebebeb",
                textAlign: "center",
            }}
        >
            <Typography gutterBottom variant="h4" component="div">
                {t("exercises.missingExercise")}
            </Typography>

            <Typography gutterBottom variant="body1" component="div">
                {t("exercises.missingExerciseDescription")}
            </Typography>

            <Link to={makeLink(WgerLink.EXERCISE_CONTRIBUTE, i18n.language)}>
                {t("exercises.contributeExercise")}
            </Link>
        </Box>
    );
};

const NoResultsBanner = () => {
    const [t] = useTranslation();

    return (
        <Box
            marginTop={4}
            padding={4}
            sx={{
                width: "100%",
                backgroundColor: "#ebebeb",
                textAlign: "center",
            }}
        >
            <Typography gutterBottom variant="h4" component="div">
                {t("noResults")}
            </Typography>

            <Typography gutterBottom variant="body1" component="div">
                {t("noResultsDescription")}
            </Typography>
        </Box>
    );
};

export const ExerciseOverviewList = () => {
    const basesQuery = useExercisesQuery();
    const [t, i18n] = useTranslation();
    const navigate = useNavigate();
    const { selectedCategories, selectedEquipment, selectedMuscles } = useContext(ExerciseFiltersContext);
    const isMobile = useMediaQuery('(max-width:600px)');

    const [page, setPage] = React.useState(1);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handlePageChange = (event: any, value: number) => {
        setPage(value);

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    const filteredExercises = useMemo(() => {
        let filteredExercises = basesQuery.data || [];

        // Filter exercise bases by categories
        if (selectedCategories.length > 0) {
            filteredExercises = filteredExercises!.filter(exercise => {
                return selectedCategories.some(
                    category => exercise.category.id === category.id
                );
            });
        }

        // Filter exercises that have one of the selected equipment
        if (selectedEquipment.length > 0) {
            filteredExercises = filteredExercises!.filter(exercise => {
                return exercise.equipment.some(equipment =>
                    selectedEquipment.some(
                        selectedEquipment => selectedEquipment.id === equipment.id
                    )
                );
            });
        }

        // Filter exercises that have one of the selected muscles
        if (selectedMuscles.length > 0) {
            filteredExercises = filteredExercises!.filter(exercise => {
                return exercise.muscles.some(muscle =>
                    selectedMuscles.some(selectedMuscle => selectedMuscle.id === muscle.id)
                );
            });
        }

        return filteredExercises;
    }, [basesQuery.data, selectedCategories, selectedEquipment, selectedMuscles]);

    // Should be a multiple of three, since there are three columns in the grid
    const ITEMS_PER_PAGE = 21;

    // Pagination calculations
    const pageCount = Math.ceil(filteredExercises!.length / ITEMS_PER_PAGE);
    const paginatedExercises = filteredExercises!.slice(
        (page - 1) * ITEMS_PER_PAGE,
        page * ITEMS_PER_PAGE
    );

    const exerciseAdded = (exercise: Exercise | null) => {
        if (!exercise) {
            return;
        }

        navigate(makeLink(WgerLink.EXERCISE_DETAIL, i18n.language, { id: exercise.id }));
    };

    return (
        (<Container maxWidth="lg">
            <Grid container spacing={2} mt={2}>
                <Grid
                    size={{
                        xs: 10,
                        sm: 6
                    }}>
                    <Typography gutterBottom variant="h3" component="div">
                        {t("exercises.exercises")}
                    </Typography>
                </Grid>
                {isMobile ? (
                    <>
                        <Grid
                            size={{
                                xs: 2,
                                sm: 6
                            }}>
                            <Button
                                variant="contained"
                                onClick={() => navigate(makeLink(WgerLink.EXERCISE_CONTRIBUTE, i18n.language))}
                            >
                                <AddIcon />
                            </Button>
                        </Grid>
                        <Grid
                            flexGrow={1}
                            size={{
                                sm: 6
                            }}>
                            <NameAutocompleter callback={exerciseAdded} />
                        </Grid>
                        <Grid
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                            size={{
                                xs: 2,
                                sm: 6
                            }}>
                            <FilterDrawer>
                                <CategoryFilterDropdown />
                                <EquipmentFilterDropdown />
                                <MuscleFilterDropdown />
                            </FilterDrawer>
                        </Grid>
                    </>
                ) : (
                    <>
                        <Grid
                            size={{
                                xs: 12,
                                sm: 3
                            }}>
                            <NameAutocompleter callback={exerciseAdded} />
                        </Grid>
                        <Grid
                            size={{
                                xs: 12,
                                sm: 3
                            }}>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => navigate(makeLink(WgerLink.EXERCISE_CONTRIBUTE, i18n.language))}
                            >
                                {t('exercises.contributeExercise')}
                            </Button>
                        </Grid>
                    </>
                )}

                {!isMobile && (
                    <Grid
                        size={{
                            xs: 12,
                            sm: 3
                        }}>
                        <Grid container spacing={1}>
                            <Grid
                                size={{
                                    xs: 6,
                                    sm: 12
                                }}>
                                <CategoryFilter />
                            </Grid>

                            <Grid
                                size={{
                                    xs: 6,
                                    sm: 12
                                }}>
                                <EquipmentFilter />
                            </Grid>

                            <Grid size={12}>
                                <MuscleFilter />
                            </Grid>
                        </Grid>
                    </Grid>
                )}

                <Grid
                    size={{
                        xs: 12,
                        sm: 9
                    }}>
                    {basesQuery.isLoading
                        ? <ExerciseGridSkeleton />
                        : <>
                            <ExerciseGrid exercises={paginatedExercises} />
                            <Stack spacing={2} alignItems="center" sx={{ mt: 2 }}>
                                <Pagination
                                    count={pageCount}
                                    color="primary"
                                    page={page}
                                    onChange={handlePageChange}
                                />
                            </Stack>
                        </>
                    }

                    <ContributeExerciseBanner />
                </Grid>
            </Grid>
        </Container>)
    );
};

export const ExerciseOverview = () => {
    const [selectedEquipment, setSelectedEquipment] = useState<Equipment[]>([]);
    const [selectedMuscles, setSelectedMuscles] = useState<Muscle[]>([]);
    const [selectedCategories, setSelectedCategories] = React.useState<Category[]>([]);

    return (
        <ExerciseFiltersContext.Provider value={{
            selectedEquipment,
            setSelectedEquipment,
            selectedMuscles,
            setSelectedMuscles,
            selectedCategories,
            setSelectedCategories
        }}>
            <ExerciseOverviewList />
        </ExerciseFiltersContext.Provider>
    );
};
