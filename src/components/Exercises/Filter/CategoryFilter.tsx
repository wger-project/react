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
import { Category } from "components/Exercises/models/category";
import React, { useContext } from 'react';
import { useTranslation } from "react-i18next";
import { LoadingPlaceholder } from '../../Core/LoadingWidget/LoadingWidget';
import { useCategoriesQuery } from '../queries';
import { ExerciseFiltersContext } from './ExerciseFiltersContext';

const CategoryFilterList = () => {

    const { data: categories, isLoading } = useCategoriesQuery();
    const { selectedCategories, setSelectedCategories } = useContext(ExerciseFiltersContext);

    const handleToggle = (value: Category) => () => {
        const currentIndex = selectedCategories.indexOf(value);
        const newChecked = [...selectedCategories];

        if (currentIndex === -1) {
            newChecked.push(value);
        } else {
            newChecked.splice(currentIndex, 1);
        }

        setSelectedCategories(newChecked);
    };

    if (isLoading) {
        return <LoadingPlaceholder />;
    }

    return (
        <List>
            {categories!.map((category) => {
                const labelId = `checkbox-list-label-${category.id}`;

                return (
                    <ListItem
                        key={category.id}
                        disablePadding
                    >
                        <ListItemButton role={undefined} onClick={handleToggle(category)} dense>
                            <ListItemIcon>
                                <Switch
                                    key={`category-${category.id}`}
                                    edge="start"
                                    checked={selectedCategories.indexOf(category) !== -1}
                                    tabIndex={-1}
                                    disableRipple
                                    inputProps={{ 'aria-labelledby': labelId }}
                                />
                            </ListItemIcon>
                            <ListItemText
                                id={labelId}
                                primary={category.translatedName}
                            />
                        </ListItemButton>
                    </ListItem>
                );
            })}
        </List>
    );
};

export const CategoryFilterDropdown = () => {
    const [t] = useTranslation();

    return (
        <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                {t('category')}
            </AccordionSummary>
            <AccordionDetails>
                <CategoryFilterList />
            </AccordionDetails>
        </Accordion>
    );
};

export const CategoryFilter = () => {
    const [t] = useTranslation();

    return (
        <div data-testid={"categories"}>
            <Paper>
                <Typography gutterBottom variant="h6" m={2}>
                    {t('category')}
                </Typography>
                <CategoryFilterList />
            </Paper>
        </div>
    );
};