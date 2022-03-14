import React from 'react';
import { Card, CardActionArea, CardContent, CardMedia, Chip, Typography } from "@mui/material";
import { ExerciseBase } from "components/Exercises/models/exerciseBase";
import { Language } from "components/Exercises/models/language";
import { ENGLISH_LANGUAGE_ID } from "utils/consts";
import { Link } from 'react-router-dom';

type OverviewCardProps = {
    exerciseBase: ExerciseBase;
    language?: Language
}


export const OverviewCard = ({ exerciseBase, language }: OverviewCardProps) => {


    const exercise = exerciseBase.getTranslation(language != null ? language.id : ENGLISH_LANGUAGE_ID);

    return (
        <Link style={{textDecoration: "none"}} to={`${exerciseBase.id}`}>
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
                        
                        <Chip label={exerciseBase.category.name} key={exerciseBase.category.id} />
                        {exerciseBase.equipment.map((equipment,) => (
                            <Chip label={equipment.name} variant={"outlined"} key={equipment.id} />
                        ))}
                    </CardContent>
                </CardActionArea>
            </Card>
        </Link>
    );
};