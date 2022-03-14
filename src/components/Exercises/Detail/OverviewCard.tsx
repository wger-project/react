import React from 'react';
import { Card, CardActionArea, CardContent, CardMedia, Chip, Typography } from "@mui/material";
import { ExerciseBase } from "components/Exercises/models/exerciseBase";
import { Language } from "components/Exercises/models/language";
import { ENGLISH_LANGUAGE_ID } from "utils/consts";
import { Link } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import { getTranslationKey } from "utils/strings";

type OverviewCardProps = {
    exerciseBase: ExerciseBase;
    language?: Language
}


export const OverviewCard = ({ exerciseBase, language }: OverviewCardProps) => {


    const exercise = exerciseBase.getTranslation(language != null ? language.id : ENGLISH_LANGUAGE_ID);
    const [t] = useTranslation();

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
                        {exercise.nameLong}
                    </Typography>

                    <Chip
                        label={t(getTranslationKey(exerciseBase.category.name))}
                        key={exerciseBase.category.id}
                        sx={{ position: "absolute", top: 8, left: 8 }}
                        color="warning"
                        size="small"
                    />
                    {exerciseBase.equipment.map((equipment,) => (
                        <Typography display="inline" mr={1} key={equipment.id}>
                            {t(getTranslationKey(equipment.name))}
                        </Typography>
                    ))}
                    {exerciseBase.equipment.length === 0 && (
                        <Typography color="text.secondary" display="inline" mr={1}>
                            {t('exercises.no-equipment')}
                        </Typography>
                    )}
                </CardContent>
            </CardActionArea>
        </Card>
        </Link>
    );
};