import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Paper,
    Switch,
    Typography
} from "@mui/material";
import { Equipment } from "components/Exercises/models/equipment";
import React, { useContext } from 'react';
import { useTranslation } from "react-i18next";
import { LoadingPlaceholder } from '../../Core/LoadingWidget/LoadingWidget';
import { useEquipmentQuery } from '../queries';
import { ExerciseFiltersContext } from './ExerciseFiltersContext';

const EquipmentFilterList = () => {

    const { data: equipment, isLoading } = useEquipmentQuery();
    const { selectedEquipment, setSelectedEquipment } = useContext(ExerciseFiltersContext);
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

    if (isLoading) {
        return <LoadingPlaceholder />;
    }

    return (
        <List sx={{ maxHeight: "500px", overflowY: "auto" }}>
            {equipment!.map((equipment) => {
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
                            <ListItemText
                                id={labelId}
                                primary={equipment.translatedName}
                            />
                        </ListItemButton>
                    </ListItem>
                );
            })}
        </List>
    );
};

export const EquipmentFilterDropdown = () => {
    const [t] = useTranslation();

    return (
        <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                {t('exercises.equipment')}
            </AccordionSummary>
            <AccordionDetails>
                <EquipmentFilterList />
            </AccordionDetails>
        </Accordion>
    );
};

export const EquipmentFilter = () => {
    const [t] = useTranslation();

    return (
        <div data-testid={"equipment"}>
            <Paper sx={{ mt: 2 }}>
                <Typography gutterBottom variant="h6" m={2}>
                    {t('exercises.equipment')}
                </Typography>
                <EquipmentFilterList />
            </Paper>
        </div>
    );
};