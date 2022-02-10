import React, { useCallback, useEffect } from 'react';
import { setMuscles, useExerciseStateValue } from 'state';
import { Box, Button, Container, Grid, ImageList, ImageListItem, Typography } from "@mui/material";
import { CategoryFilter } from "components/Exercises/Filter/CategoryFilter";
import { EquipmentFilter } from "components/Exercises/Filter/EquipmentFilter";
import { MuscleFilter } from "components/Exercises/Filter/MuscleFilter";
import { OverviewCard } from "components/Exercises/Detail/OverviewCard";
import { useTranslation } from "react-i18next";
import { getCategories, getEquipment, getExerciseBases, getMuscles } from "services";
import { setCategories, setEquipment, setExerciseBases } from "state/exerciseReducer";

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

    //console.log(state);
    return (
        <Container maxWidth="lg">
            <Typography gutterBottom variant="h3" component="div">
                {t('exercises')}
            </Typography>
            <Grid container spacing={2}>
                <Grid item xs={3}>
                    <CategoryFilter categories={state.categories} />
                    <EquipmentFilter equipment={state.equipment} />
                    <MuscleFilter muscles={state.muscles} />
                </Grid>
                <Grid item xs={9}>
                    <ImageList cols={3}>
                        {state.exerciseBases.map(b => (<ImageListItem>
                            <OverviewCard exerciseBase={b} />
                        </ImageListItem>))}
                        
                    </ImageList>
                    <ContributeExerciseBanner
                    />
                </Grid>
            </Grid>
        </Container>
    );
};