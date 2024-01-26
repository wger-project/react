import { Card, CardActionArea, CardContent, CardMedia, Chip, Typography, } from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import { ExerciseImageAvatar } from "components/Exercises/Detail/ExerciseImageAvatar";
import { Exercise } from "components/Exercises/models/exercise";
import { Language } from "components/Exercises/models/language";
import React from "react";
import { useTranslation } from "react-i18next";
import { ENGLISH_LANGUAGE_ID } from "utils/consts";
import { getTranslationKey } from "utils/strings";
import { makeLink, WgerLink } from "utils/url";

type OverviewCardProps = {
    exerciseBase: Exercise;
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
                        <ExerciseImageAvatar image={exerciseBase.mainImage!} />
                    </CardMedia>}
                <CardContent>
                    <Tooltip title={exercise.name} placement="top" arrow>
                        <Typography gutterBottom variant="h6" component="div" noWrap>
                            {exercise.name}
                        </Typography>
                    </Tooltip>

                    <Chip
                        label={t(getTranslationKey(exerciseBase.category.name))}
                        key={exerciseBase.category.id}
                        sx={{ position: "absolute", top: 8, left: 8 }}
                        color="primary"
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
