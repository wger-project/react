import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Paper,
    Switch,
    Typography
} from "@mui/material";
import { LoadingPlaceholder } from "components/Core/LoadingWidget/LoadingWidget";
import { LightTooltip } from "components/Core/Tooltips/LightToolTip";
import { Muscle } from "components/Exercises/models/muscle";
import { MuscleOverview } from "components/Muscles/MuscleOverview";
import React, { useContext } from 'react';
import { useTranslation } from "react-i18next";
import { useMusclesQuery } from '../queries';
import { ExerciseFiltersContext } from './ExerciseFiltersContext';

const MuscleFilterList = () => {

    const { data: muscles, isLoading } = useMusclesQuery();
    const { selectedMuscles, setSelectedMuscles } = useContext(ExerciseFiltersContext);

    const handleToggle = (value: Muscle) => () => {
        const currentIndex = selectedMuscles.indexOf(value);
        const newChecked = [...selectedMuscles];

        if (currentIndex === -1) {
            newChecked.push(value);
        } else {
            newChecked.splice(currentIndex, 1);
        }

        setSelectedMuscles(newChecked);
    };

    if (isLoading) {
        return <LoadingPlaceholder />;
    }

    return (
        <List sx={{ maxHeight: "500px", overflowY: "auto" }}>
            {muscles!.map((m) => {
                const labelId = `checkbox-list-label-${m.id}`;

                return (
                    <ListItem
                        key={m.id}
                        disablePadding
                        secondaryAction={
                            <LightTooltip
                                title={
                                    <MuscleOverview
                                        primaryMuscles={[m]}
                                        secondaryMuscles={[]}
                                        isFront={m.isFront}
                                    />
                                }
                                placement="right"
                                arrow>
                                <IconButton edge="end" aria-label="comments">
                                    <InfoOutlinedIcon />
                                </IconButton>
                            </LightTooltip>
                        }
                    >
                        <ListItemButton role={undefined} onClick={handleToggle(m)} dense>
                            <ListItemIcon>
                                <Switch
                                    key={`muscle-${m.id}`}
                                    edge="start"
                                    checked={selectedMuscles.indexOf(m) !== -1}
                                    tabIndex={-1}
                                    disableRipple
                                    inputProps={{ 'aria-labelledby': labelId }}
                                />
                            </ListItemIcon>

                            <ListItemText
                                id={labelId}
                                primary={m.name}
                                secondary={m.nameEn !== '' ? m.translatedName : ''}
                            />

                        </ListItemButton>
                    </ListItem>
                );
            })}
        </List>
    );
};

export const MuscleFilterDropdown = () => {

    const [t] = useTranslation();

    return (
        <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                {t('exercises.muscles')}
            </AccordionSummary>
            <AccordionDetails>
                <MuscleFilterList />
            </AccordionDetails>
        </Accordion>
    );
};

export const MuscleFilter = () => {

    const [t] = useTranslation();

    return (
        <div data-testid={"muscles"}>
            <Paper sx={{ mt: 2 }}>
                <Typography gutterBottom variant="h6" m={2}>
                    {t('exercises.muscles')}
                </Typography>
                <MuscleFilterList />
            </Paper>
        </div>
    );
};