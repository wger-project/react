import React, { useCallback, useEffect } from 'react';
import { getMuscles } from 'services';
import { useStateValue } from 'state';
import { Container, Grid, ImageList, ImageListItem } from "@mui/material";
import { CategoryFilter } from "components/Exercises/Filter/CategoryFilter";
import { EquipmentFilter } from "components/Exercises/Filter/EquipmentFilter";
import { MuscleFilter } from "components/Exercises/Filter/MuscleFilter";
import { OverviewCard } from "components/Exercises/Detail/OverviewCard";

export const ExerciseOverview = () => {
    const [state, dispatch] = useStateValue();

    // Using useCallback so that I can use this fetchWeight method in
    // useEffect and elsewhere.
    const fetchMuscles = useCallback(async () => {
        try {
            const receivedMuscles = await getMuscles();
            //dispatch(setWeights(receivedMuscles));
        } catch (error) {
            console.log(error);
        }
    }, [dispatch]);

    useEffect(() => {
        fetchMuscles();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchMuscles]);

    return (
        <Container maxWidth="lg">
            <Grid container spacing={2}>
                <Grid item xs={4}>
                    <CategoryFilter />
                    <EquipmentFilter />
                    <MuscleFilter />
                </Grid>
                <Grid item xs={8}>
                    <ImageList cols={3}>
                        <ImageListItem>
                            <OverviewCard />
                        </ImageListItem>
                        <ImageListItem>
                            <OverviewCard />
                        </ImageListItem>
                        <ImageListItem>
                            <OverviewCard />
                        </ImageListItem>
                        <ImageListItem>
                            <OverviewCard />
                        </ImageListItem>
                        <ImageListItem>
                            <OverviewCard />
                        </ImageListItem>
                        <ImageListItem>
                            <OverviewCard />
                        </ImageListItem>
                        <ImageListItem>
                            <OverviewCard />
                        </ImageListItem>
                        <ImageListItem>
                            <OverviewCard />
                        </ImageListItem>
                    </ImageList>
                </Grid>
            </Grid>
        </Container>
    );
};