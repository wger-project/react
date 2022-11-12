import React from "react";
import { Box, Card, CardActionArea, CardContent, CardMedia, Chip, Typography, } from "@mui/material";
import { ExerciseBase } from "components/Exercises/models/exerciseBase";
import { Language } from "components/Exercises/models/language";
import { ENGLISH_LANGUAGE_ID } from "utils/consts";
import { useTranslation } from "react-i18next";
import { getTranslationKey } from "utils/strings";
import PhotoIcon from '@mui/icons-material/Photo';
import { makeLink, WgerLink } from "utils/url";

type OverviewCardProps = {
    exerciseBase: ExerciseBase;
    language?: Language;
};

export const OverviewCard = ({ exerciseBase, language }: OverviewCardProps) => {
    const exercise = language
        ? exerciseBase.getTranslation(language)
        : exerciseBase.getTranslation(
            new Language(ENGLISH_LANGUAGE_ID, "en", "English")
        );
    const [t, i18n] = useTranslation();

    return (
        <Card key={exerciseBase.id} sx={{ width: '100%' }}>
            <CardActionArea href={makeLink(WgerLink.EXERCISE_DETAIL, i18n.language, {
                id: exerciseBase.id!,
                slug: exercise.nameSlug
            })}
                            sx={{ minHeight: 330 }}>
                {exerciseBase.mainImage
                    ? <CardMedia
                        component="img"
                        image={exerciseBase.mainImage.url}
                        sx={{ height: 200 }}
                        alt="" />
                    : <CardMedia>
                        <Box sx={{ backgroundColor: "lightgray", height: 200 }}

                             display="flex"
                             alignItems="center"
                             justifyContent="center">
                            <PhotoIcon sx={{ fontSize: 80, color: "gray" }} />
                        </Box>
                    </CardMedia>}
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
