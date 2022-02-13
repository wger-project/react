import React from 'react';
import { Card, CardActionArea, CardContent, CardMedia, Chip, Typography } from "@mui/material";
import { ExerciseBase } from "components/Exercises/models/exerciseBase";
import { Language } from "components/Exercises/models/language";
import { ENGLISH_LANGUAGE_ID } from "utils/consts";

type OverviewCardProps = {
    exerciseBase: ExerciseBase;
    language?: Language
}


export const OverviewCard = ({ exerciseBase, language }: OverviewCardProps) => {


    const exercise = exerciseBase.getTranslation(language != null ? language.id : ENGLISH_LANGUAGE_ID);

    return (
        <Card key={exerciseBase.id}>
            <CardActionArea>
                <CardMedia
                    component="img"
                    image="https://mui.com/static/images/cards/contemplative-reptile.jpg"
                    alt="green iguana"
                />
                <CardContent>
                    <Typography gutterBottom variant="h6" component="div">
                        {exercise.name}
                    </Typography>
                    <Typography color="text.secondary">
                        { /* TODO: chips tripper an error: <div> cannot appear as a descendant of <p> */}
                        <Chip label={exerciseBase.category.name} key={exerciseBase.category.id} />

                        {exerciseBase.equipment.map((equipment,) => (
                            <Chip label={equipment.name} variant={"outlined"} key={equipment.id} />
                        ))}
                    </Typography>
                </CardContent>
            </CardActionArea>
        </Card>
    );
};