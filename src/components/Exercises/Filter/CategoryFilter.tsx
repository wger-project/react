import React from 'react';
import { List, ListItem, ListItemButton, ListItemIcon, ListItemText, Paper, Switch, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Category } from "components/Exercises/models/category";


type CategoryFilterProps = {
    categories: Category[];
    selectedCategories: Category[];
    setSelectedCategories: (categories: Category[]) => void;
}

export const CategoryFilter = ({ categories, selectedCategories, setSelectedCategories }: CategoryFilterProps) => {

    const [t] = useTranslation();

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

    return (
        <div data-testid={"categories"}>
            <Paper>
                <Typography gutterBottom variant="h6" component="div">
                    {t('category')}
                </Typography>
                <List>
                    {categories.map((category) => {
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
                                    <ListItemText id={labelId} primary={category.name} />
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
                </List>
            </Paper>
        </div>
    );
};