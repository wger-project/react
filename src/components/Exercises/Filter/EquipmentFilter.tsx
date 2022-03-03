import React from 'react';
import { List, ListItem, ListItemButton, ListItemIcon, ListItemText, Paper, Switch, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Equipment } from "components/Exercises/models/equipment";
import { getTranslationKey } from "utils/strings";


type EquipmentFilterProps = {
    equipment: Equipment[];
    selectedEquipment: Equipment[];
    setSelectedEquipment: (equipment: Equipment[]) => void;
}

export const EquipmentFilter = ({ equipment, selectedEquipment, setSelectedEquipment }: EquipmentFilterProps) => {

    const [t] = useTranslation();

    const handleToggle = (value: Equipment) => () => {
        const currentIndex = selectedEquipment.indexOf(value);
        const newChecked = [...selectedEquipment];

        if (currentIndex === -1) {
            newChecked.push(value);
        } else {
            newChecked.splice(currentIndex, 1);
        }

        setSelectedEquipment(newChecked);
    };

    return (
        <div data-testid={"equipment"}>
            <Paper sx={{ mt: 2 }}>
                <Typography gutterBottom variant="h6" component="div">
                    {t('exercises.equipment')}
                </Typography>
                <List>
                    {equipment.map((equipment) => {
                        const labelId = `checkbox-list-label-${equipment.id}`;

                        return (
                            <ListItem
                                key={equipment.id}
                                disablePadding
                            >
                                <ListItemButton role={undefined} onClick={handleToggle(equipment)} dense>
                                    <ListItemIcon>
                                        <Switch
                                            key={`muscle-${equipment.id}`}
                                            edge="start"
                                            checked={selectedEquipment.indexOf(equipment) !== -1}
                                            tabIndex={-1}
                                            disableRipple
                                            inputProps={{ 'aria-labelledby': labelId }}
                                        />
                                    </ListItemIcon>
                                    <ListItemText id={labelId} primary={t(getTranslationKey(equipment.name))} />
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
                </List>
            </Paper>
        </div>
    );
};