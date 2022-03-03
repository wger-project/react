import React, { useCallback, useEffect } from 'react';
import { setMuscles, useExerciseStateValue } from 'state';
import { Box, Button, Container, Grid, Pagination, Stack, Typography } from "@mui/material";
import { CategoryFilter } from "components/Exercises/Filter/CategoryFilter";
import { EquipmentFilter } from "components/Exercises/Filter/EquipmentFilter";
import { MuscleFilter } from "components/Exercises/Filter/MuscleFilter";
import { useTranslation } from "react-i18next";
import { getCategories, getEquipment, getExerciseBases, getMuscles } from "services";
import { setCategories, setEquipment, setExerciseBases, setLanguages } from "state/exerciseReducer";
import { ExerciseGrid } from "components/Exercises/Overview/ExerciseGrid";
import { getLanguages } from "services/language";
import { Equipment } from "components/Exercises/models/equipment";
import { Muscle } from "components/Exercises/models/muscle";
import { Category } from "components/Exercises/models/category";
import { NameAutocompleter } from "components/Exercises/Filter/NameAutcompleter";
import { ExerciseSearchResponse } from "services/responseType";

const ContributeExerciseBanner = () => {
    const [t] = useTranslation();

    return <Box
        marginTop={4}
        padding={4}
        sx={{
            width: "100%",
            backgroundColor: "#ebebeb",
            textAlign: "center",
        }}
    >
        <Typography gutterBottom variant="h4" component="div">
            {t('missing-exercise')}
        </Typography>

        <Typography gutterBottom variant="body1" component="div">
            {t('missing-exercise-description')}
        </Typography>

        <Button variant="contained">
            {t('contribute-exercise')}
        </Button>
    </Box>;
};

const NoResultsBanner = () => {
    const [t] = useTranslation();

    return <Box
        marginTop={4}
        padding={4}
        sx={{
            width: "100%",
            backgroundColor: "#ebebeb",
            textAlign: "center",
        }}
    >
        <Typography gutterBottom variant="h4" component="div">
            {t('no-results')}
        </Typography>

        <Typography gutterBottom variant="body1" component="div">
            {t('no-results-description')}
        </Typography>

    </Box>;
};

export const ExerciseOverview = () => {
    const [state, dispatch] = useExerciseStateValue();
    const [t] = useTranslation();

    const [selectedEquipment, setSelectedEquipment] = React.useState<Equipment[]>([]);
    const [selectedMuscles, setSelectedMuscles] = React.useState<Muscle[]>([]);
    const [selectedCategories, setSelectedCategories] = React.useState<Category[]>([]);

    const [page, setPage] = React.useState(1);
    const handleChange = (event: any, value: number) => {
        setPage(value);
    };

    // Should be a multiple of three, since there are three columns in the grid
    const ITEMS_PER_PAGE = 21;


    const fetchExerciseBases = useCallback(async () => {
        try {
            dispatch(setExerciseBases(await getExerciseBases()));
        } catch (error) {
            console.log(error);
        }
    }, [dispatch]);

    const fetchMuscles = useCallback(async () => {
        try {
            dispatch(setMuscles(await getMuscles()));
        } catch (error) {
            console.log(error);
        }
    }, [dispatch]);

    const fetchEquipment = useCallback(async () => {
        try {
            dispatch(setEquipment(await getEquipment()));
        } catch (error) {
            console.log(error);
        }
    }, [dispatch]);

    const fetchCategories = useCallback(async () => {
        try {
            dispatch(setCategories(await getCategories()));
        } catch (error) {
            console.log(error);
        }
    }, [dispatch]);

    const fetchLanguages = useCallback(async () => {
        try {
            dispatch(setLanguages(await getLanguages()));
        } catch (error) {
            console.log(error);
        }
    }, [dispatch]);

    useEffect(() => {
        fetchMuscles();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchMuscles]);
    useEffect(() => {
        fetchCategories();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchCategories]);
    useEffect(() => {
        fetchEquipment();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchEquipment]);
    useEffect(() => {
        fetchExerciseBases();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchExerciseBases]);
    useEffect(() => {
        fetchLanguages();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchLanguages]);

    let filteredExerciseBases = [...state.exerciseBases];

    // Filter exercise bases by categories
    if (selectedCategories.length > 0) {
        filteredExerciseBases = filteredExerciseBases.filter(exerciseBase => {
            return selectedCategories.some(category => exerciseBase.category.id === category.id);
        });
    }

    // Filter exercises that have one of the selected equipment
    if (selectedEquipment.length > 0) {
        filteredExerciseBases = filteredExerciseBases.filter(exerciseBase => {
            return exerciseBase.equipment.some(equipment => selectedEquipment.some(selectedEquipment => selectedEquipment.id === equipment.id));
        });
    }

    // Filter exercises that have one of the selected muscles
    if (selectedMuscles.length > 0) {
        filteredExerciseBases = filteredExerciseBases.filter(exerciseBase => {
            return exerciseBase.muscles.some(muscle => selectedMuscles.some(selectedMuscle => selectedMuscle.id === muscle.id));
        });
    }

    // Pagination calculations
    const pageCount = Math.ceil(filteredExerciseBases.length / ITEMS_PER_PAGE);
    const paginatedExerciseBases = filteredExerciseBases.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    const exerciseAdded = (exercise: ExerciseSearchResponse) => {
        console.log(`Added exercise ${exercise.value}`);
    };


    return (
        <Container maxWidth="lg">
            <Stack direction={'row'}>
                <Typography gutterBottom variant="h3" component="div">
                    {t('exercises')}
                </Typography>
                <Box sx={{ width: '100%' }} />
                <Box sx={{ width: 500 }} m={1}>
                    <NameAutocompleter callback={exerciseAdded} />
                </Box>
                {/*<Button variant="contained" startIcon={<AddIcon />}> {t('contribute-exercise')}</Button>*/}
            </Stack>


            <Grid container spacing={2}>
                <Grid item xs={3}>
                    <CategoryFilter
                        categories={state.categories}
                        selectedCategories={selectedCategories}
                        setSelectedCategories={setSelectedCategories}
                    />
                    <EquipmentFilter
                        equipment={state.equipment}
                        selectedEquipment={selectedEquipment}
                        setSelectedEquipment={setSelectedEquipment}
                    />
                    <MuscleFilter
                        muscles={state.muscles}
                        selectedMuscles={selectedMuscles}
                        setSelectedMuscles={setSelectedMuscles}
                    />
                </Grid>
                <Grid item xs={9}>
                    {paginatedExerciseBases.length > 0 ? (
                        <ExerciseGrid
                            exerciseBases={paginatedExerciseBases}
                        />
                    ) : (
                        <NoResultsBanner />
                    )}

                    <Stack spacing={2} alignItems="center" sx={{ mt: 2 }}>
                        <Pagination
                            count={pageCount}
                            color="primary"
                            page={page}
                            onChange={handleChange}
                        />
                    </Stack>

                    { /* We don't do exercise crowdsourcing in this step */}
                    { /* <ContributeExerciseBanner /> */}

                </Grid>
            </Grid>

        </Container>
    );
};