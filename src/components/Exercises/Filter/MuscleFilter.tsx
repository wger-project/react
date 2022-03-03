import React from 'react';
import {
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
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useTranslation } from "react-i18next";
import { Muscle } from "components/Exercises/models/muscle";

type MuscleFilterProps = {
    muscles: Muscle[];
    selectedMuscles: Muscle[];
    setSelectedMuscles: (muscles: Muscle[]) => void;
}

export const MuscleFilter = ({ muscles, selectedMuscles, setSelectedMuscles }: MuscleFilterProps) => {

    const [t] = useTranslation();

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

    return (
        <div data-testid={"muscles"}>
            <Paper sx={{ mt: 2 }}>
                <Typography gutterBottom variant="h6" component="div">
                    {t('exercises.muscles')}
                </Typography>
                <List>
                    {muscles.map((m) => {
                        const labelId = `checkbox-list-label-${m.id}`;

                        return (
                            <ListItem
                                key={m.id}
                                disablePadding
                                secondaryAction={
                                    <IconButton edge="end" aria-label="comments">
                                        <InfoOutlinedIcon />
                                    </IconButton>
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
                                    <ListItemText id={labelId} primary={m.name} />
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
                </List>
            </Paper>
        </div>
    );
};