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

export const ContributeExerciseBanner = () => {
    const [t, i18n] = useTranslation();

    return <Box
        marginTop={4}
        padding={4}
        sx={{
            width: "100%",
            backgroundColor: "#ebebeb",
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

export const ExerciseOverview = () => {
    const [state, dispatch] = useExerciseStateValue();
    const [t, i18n] = useTranslation();

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
            const receivedExerciseBases = await getExerciseBases();
            dispatch(setExerciseBases(receivedExerciseBases));
        } catch (error) {
            console.log(error);
        }
    }, [dispatch]);

    const fetchMuscles = useCallback(async () => {
        try {
            const receivedMuscles = await getMuscles();
            dispatch(setMuscles(receivedMuscles));
        } catch (error) {
            console.log(error);
        }
    }, [dispatch]);

    const fetchEquipment = useCallback(async () => {
        try {
            const equipment = await getEquipment();
            dispatch(setEquipment(equipment));
        } catch (error) {
            console.log(error);
        }
    }, [dispatch]);

    const fetchCategories = useCallback(async () => {
        try {
            const receivedCategories = await getCategories();
            dispatch(setCategories(receivedCategories));
        } catch (error) {
            console.log(error);
        }
    }, [dispatch]);

    const fetchLanguages = useCallback(async () => {
        try {
            const receivedLanguages = await getLanguages();
            dispatch(setLanguages(receivedLanguages));
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


    return (
        <Container maxWidth="lg">
            <Typography gutterBottom variant="h3" component="div">
                {t('exercises')}
            </Typography>

            <Grid container spacing={2}>
                <Grid item xs={3}>
                    <NameAutocompleter />
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
                    <ExerciseGrid
                        exerciseBases={paginatedExerciseBases}
                    />
                    <Stack spacing={2} alignItems="center">
                        <Pagination
                            count={pageCount}
                            color="primary"
                            page={page}
                            onChange={handleChange}
                        />
                    </Stack>
                    <ContributeExerciseBanner />
                </Grid>
            </Grid>

        </Container>
    );
};