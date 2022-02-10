import React from 'react';
import { List, ListItem, ListItemButton, ListItemIcon, ListItemText, Paper, Switch, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Equipment } from "components/Exercises/models/equipment";


type EquipmentFilterProps = {
    equipment: Equipment[];
}

export const EquipmentFilter = ({ equipment }: EquipmentFilterProps) => {

    const [checked, setChecked] = React.useState([0]);
    const [t, i18n] = useTranslation();

    const handleToggle = (value: number) => () => {
        const currentIndex = checked.indexOf(value);
        const newChecked = [...checked];

        if (currentIndex === -1) {
            newChecked.push(value);
        } else {
            newChecked.splice(currentIndex, 1);
        }

        setChecked(newChecked);
    };

    return (
        <div>
            <Typography gutterBottom variant="h6" component="div">
                {t('equipment')}
            </Typography>
            <Paper>
                <List>
                    {equipment.map((equipment) => {
                        const labelId = `checkbox-list-label-${equipment.id}`;

                        return (
                            <ListItem
                                key={equipment.id}
                                disablePadding
                            >
                                <ListItemButton role={undefined} onClick={handleToggle(equipment.id)} dense>
                                    <ListItemIcon>
                                        <Switch
                                            edge="start"
                                            checked={checked.indexOf(equipment.id) !== -1}
                                            tabIndex={-1}
                                            disableRipple
                                            inputProps={{ 'aria-labelledby': labelId }}
                                        />
                                    </ListItemIcon>
                                    <ListItemText id={labelId} primary={equipment.name} />
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
                </List>
            </Paper>
        </div>
    );
};