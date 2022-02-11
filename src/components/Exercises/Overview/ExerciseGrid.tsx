import React from 'react';
import { ImageList, ImageListItem } from "@mui/material";
import { ExerciseBase } from "components/Exercises/models/exerciseBase";
import { OverviewCard } from "components/Exercises/Detail/OverviewCard";

type ExerciseGridProps = {
    exerciseBases: ExerciseBase[];
}

export const ExerciseGrid = ({ exerciseBases }: ExerciseGridProps) => {


    return (
        <ImageList cols={3}>
            {exerciseBases.map(b => (<ImageListItem key={b.id}>
                <OverviewCard exerciseBase={b} />
            </ImageListItem>))}
        </ImageList>
    );
};