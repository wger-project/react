import React from "react";
import {
    Avatar,
    Box,
    Button,
    List,
    ListItem,
    ListItemAvatar,
    ListItemButton,
    ListItemText,
    Paper,
    Switch,
    Typography
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useBasesQuery } from "components/Exercises/queries";
import { ExerciseBase } from "components/Exercises/models/exerciseBase";
import { LoadingWidget } from "components/Core/LoadingWidget/LoadingWidget";
import { StepProps } from "components/Exercises/Add/AddExerciseStepper";

//const ExerciseInfoListItem = () =>


// New component that displays the exercise info in a ListItem
const ExerciseInfoListItem = ({ exerciseBase }: { exerciseBase: ExerciseBase }) => {
    return <>
        <ListItem disablePadding secondaryAction={
            <Switch />
        }>
            <ListItemButton>
                <ListItemAvatar>
                    <Avatar src="https://mui.com/static/images/cards/contemplative-reptile.jpg">
                    </Avatar>
                </ListItemAvatar>
                <ListItemText primary={exerciseBase.getTranslation().name} secondary="Jan 9, 2014" />
            </ListItemButton>
        </ListItem>
    </>;
};


export const Step2Variations = ({
                                    onContinue,
                                    onBack,
                                    setNewExerciseData,
                                    newExerciseData,
                                }: StepProps) => {
    const [t] = useTranslation();
    const basesQuery = useBasesQuery();

    return <>
        <Paper sx={{ p: 2 }}>
            <Typography>{t('exercises.whatVariationsExist')}</Typography>

            {basesQuery.isLoading ? (
                <Box>
                    <LoadingWidget />
                </Box>
            ) : (
                <List style={{ maxHeight: "400px", overflowY: "scroll" }}>
                    {basesQuery.data!.filter(base => base.variationId === null).map(base => (
                        <ExerciseInfoListItem exerciseBase={base} key={base.id} />
                    ))}
                </List>
            )}
        </Paper>

        <Box sx={{ mb: 2 }}>
            <div>
                <Button
                    variant="contained"
                    onClick={onContinue}
                    sx={{ mt: 1, mr: 1 }}
                >
                    {t('continue')}
                </Button>
                <Button
                    disabled={false}
                    onClick={onBack}
                    sx={{ mt: 1, mr: 1 }}
                >
                    {t('goBack')}
                </Button>
            </div>
        </Box>
    </>;
};