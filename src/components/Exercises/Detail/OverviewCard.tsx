import React from "react";
import { Card, CardActionArea, CardContent, CardMedia, Chip, Typography, } from "@mui/material";
import { ExerciseBase } from "components/Exercises/models/exerciseBase";
import { Language } from "components/Exercises/models/language";
import { ENGLISH_LANGUAGE_ID } from "utils/consts";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getTranslationKey } from "utils/strings";

type OverviewCardProps = {
    exerciseBase: ExerciseBase;
    language?: Language;
};

export const OverviewCard = ({ exerciseBase, language }: OverviewCardProps) => {
    const navigate = useNavigate();
    const exercise = language
        ? exerciseBase.getTranslation(language)
        : exerciseBase.getTranslation(
            new Language(ENGLISH_LANGUAGE_ID, "en", "English")
        );
    const [t] = useTranslation();

    return (
        <Card
            key={exerciseBase.id}
            onClick={() => navigate(`../${exerciseBase.id}`)}
        >
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
                    {exerciseBase.equipment.map(equipment => (
                        <Typography display="inline" mr={1} key={equipment.id}>
                            {t(getTranslationKey(equipment.name))}
                        </Typography>
                    ))}
                    {exerciseBase.equipment.length === 0 && (
                        <Typography color="text.secondary" display="inline" mr={1}>
                            {t("exercises.noEquipment")}
                        </Typography>
                    )}
                </CardContent>
            </CardActionArea>
        </Card>
    );
};
