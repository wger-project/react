import React from "react";
import { Box, Button, CircularProgress, Container, Grid, Pagination, Paper, Stack, Typography, } from "@mui/material";
import { CategoryFilter } from "components/Exercises/Filter/CategoryFilter";
import { MuscleFilter } from "components/Exercises/Filter/MuscleFilter";
import { useTranslation } from "react-i18next";
import { ExerciseGrid } from "components/Exercises/Overview/ExerciseGrid";
import { Equipment } from "components/Exercises/models/equipment";
import { Muscle } from "components/Exercises/models/muscle";
import { Category } from "components/Exercises/models/category";
import { NameAutocompleter } from "components/Exercises/Filter/NameAutcompleter";
import { EquipmentFilter } from "components/Exercises/Filter/EquipmentFilter";
import { useBasesQuery, useCategoriesQuery, useEquipmentQuery, useMusclesQuery } from "components/Exercises/queries";
import AddIcon from '@mui/icons-material/Add';
import { Link, useNavigate } from "react-router-dom";
import { ExerciseSearchResponse } from "services/responseType";
import { ExerciseGridSkeleton } from "components/Exercises/Overview/ExerciseGridLoadingSkeleton";

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

            <Link to={`/${i18n.language}/exercise/contribute`}>
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

export const LoadingPlaceholder = () => {
    return <Paper
        sx={{ height: 200, alignItems: "center", mt: 2 }}
        component={Stack}
        direction="column"
        justifyContent="center">
        <CircularProgress />
    </Paper>;
};

export const ExerciseOverview = () => {
    const basesQuery = useBasesQuery();
    const categoryQuery = useCategoriesQuery();
    const musclesQuery = useMusclesQuery();
    const equipmentQuery = useEquipmentQuery();
    const [t, i18n] = useTranslation();
    const navigate = useNavigate();

    const [selectedEquipment, setSelectedEquipment] = React.useState<Equipment[]>([]);
    const [selectedMuscles, setSelectedMuscles] = React.useState<Muscle[]>([]);
    const [selectedCategories, setSelectedCategories] = React.useState<Category[]>([]);

    const [page, setPage] = React.useState(1);
    const handlePageChange = (event: any, value: number) => {
        setPage(value);

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    // Should be a multiple of three, since there are three columns in the grid
    const ITEMS_PER_PAGE = 21;

    let filteredExerciseBases = basesQuery.data || [];

    // Filter exercise bases by categories
    if (selectedCategories.length > 0) {
        filteredExerciseBases = filteredExerciseBases!.filter(exerciseBase => {
            return selectedCategories.some(
                category => exerciseBase.category.id === category.id
            );
        });
    }

    // Filter exercises that have one of the selected equipment
    if (selectedEquipment.length > 0) {
        filteredExerciseBases = filteredExerciseBases!.filter(exerciseBase => {
            return exerciseBase.equipment.some(equipment =>
                selectedEquipment.some(
                    selectedEquipment => selectedEquipment.id === equipment.id
                )
            );
        });
    }

    // Filter exercises that have one of the selected muscles
    if (selectedMuscles.length > 0) {
        filteredExerciseBases = filteredExerciseBases!.filter(exerciseBase => {
            return exerciseBase.muscles.some(muscle =>
                selectedMuscles.some(selectedMuscle => selectedMuscle.id === muscle.id)
            );
        });
    }

    // Pagination calculations
    const pageCount = Math.ceil(filteredExerciseBases!.length / ITEMS_PER_PAGE);
    const paginatedExerciseBases = filteredExerciseBases!.slice(
        (page - 1) * ITEMS_PER_PAGE,
        page * ITEMS_PER_PAGE
    );

    const exerciseAdded = (exercise: ExerciseSearchResponse) => {
        navigate(`/${i18n.language}/exercise/${exercise.data.base_id}`);
    };

    return (
        <Container maxWidth="lg">
            <Grid container spacing={2} mt={2}>
                <Grid item xs={12} sm={6}>
                    <Typography gutterBottom variant="h3" component="div">
                        {t("exercises.exercises")}
                    </Typography>
                </Grid>
                <Grid item xs={12} sm={3}>
                    <NameAutocompleter callback={exerciseAdded} />
                </Grid>
                <Grid item xs={12} sm={3}>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => navigate(`/${i18n.language}/exercise/contribute`)}
                    >
                        {t('exercises.contributeExercise')}
                    </Button>
                </Grid>

                <Grid item xs={12} sm={3}>
                    <Grid container spacing={1}>
                        {categoryQuery.isLoading ? <LoadingPlaceholder /> : (
                            <Grid item xs={6} sm={12}>
                                <CategoryFilter
                                    categories={categoryQuery.data!}
                                    selectedCategories={selectedCategories}
                                    setSelectedCategories={setSelectedCategories}
                                />
                            </Grid>
                        )}

                        {equipmentQuery.isLoading ? <LoadingPlaceholder /> : (
                            <Grid item xs={6} sm={12}>
                                <EquipmentFilter
                                    equipment={equipmentQuery.data!}
                                    selectedEquipment={selectedEquipment}
                                    setSelectedEquipment={setSelectedEquipment}
                                />
                            </Grid>
                        )}

                        {musclesQuery.isLoading ? <LoadingPlaceholder /> : (
                            <Grid item xs={12}>
                                <MuscleFilter
                                    muscles={musclesQuery.data!}
                                    selectedMuscles={selectedMuscles}
                                    setSelectedMuscles={setSelectedMuscles}
                                />
                            </Grid>
                        )}
                    </Grid>
                </Grid>
                <Grid item xs={12} sm={9}>
                    {basesQuery.isLoading
                        ? <ExerciseGridSkeleton />
                        : <>
                            <ExerciseGrid exerciseBases={paginatedExerciseBases} />
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
        </Container>
    );
};
