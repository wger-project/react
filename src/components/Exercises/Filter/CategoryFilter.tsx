import React from 'react';
import { List, ListItem, ListItemButton, ListItemIcon, ListItemText, Paper, Switch, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Category } from "components/Exercises/models/category";


type CategoryFilterProps = {
    categories: Category[];
}

export const CategoryFilter = ({ categories }: CategoryFilterProps) => {

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
                {t('category')}
            </Typography>
            <Paper>

                <List>
                    {categories.map((category) => {
                        const labelId = `checkbox-list-label-${category.id}`;

                        return (
                            <ListItem
                                key={category.id}
                                disablePadding
                            >
                                <ListItemButton role={undefined} onClick={handleToggle(category.id)} dense>
                                    <ListItemIcon>
                                        <Switch
                                            edge="start"
                                            checked={checked.indexOf(category.id) !== -1}
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