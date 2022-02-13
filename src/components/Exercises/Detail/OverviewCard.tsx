import React from 'react';
import { Card, CardActionArea, CardContent, CardMedia, Chip, Typography } from "@mui/material";
import { ExerciseBase } from "components/Exercises/models/exerciseBase";

type OverviewCardProps = {
    exerciseBase: ExerciseBase;
}


export const OverviewCard = ({ exerciseBase }: OverviewCardProps) => {

    const exercise = exerciseBase.getTranslation('de');

    return (
        <Card>
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
                        <Chip label={exerciseBase.category.name} />

                        {exerciseBase.equipment.map((equipment,) => (
                            <Chip label={equipment.name} variant={"outlined"} />
                        ))}
                    </Typography>
                </CardContent>
            </CardActionArea>
        </Card>
    );
};