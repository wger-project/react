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
                        {exercise.nameLong}
                    </Typography>

                    <Chip
                        label={exerciseBase.category.name}
                        key={exerciseBase.category.id}
                        sx={{ position: "absolute", top: 8, left: 8 }}
                        color="warning"
                        size="small"
                    />
                    {exerciseBase.equipment.map((equipment,) => (
                        <Chip
                            label={equipment.name}
                            variant={"outlined"}
                            key={equipment.id}
                            size="small"
                        />
                    ))}
                </CardContent>
            </CardActionArea>
        </Card>
    );
};