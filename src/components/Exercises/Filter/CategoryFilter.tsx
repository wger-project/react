import React from 'react';
import { List, ListItem, ListItemButton, ListItemIcon, ListItemText, Paper, Switch, Typography } from "@mui/material";

export const CategoryFilter = () => {

    const [checked, setChecked] = React.useState([0]);

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
                Category
            </Typography>
            <Paper>

                <List>
                    {[0, 1, 2, 3].map((value) => {
                        const labelId = `checkbox-list-label-${value}`;

                        return (
                            <ListItem
                                key={value}
                                disablePadding
                            >
                                <ListItemButton role={undefined} onClick={handleToggle(value)} dense>
                                    <ListItemIcon>
                                        <Switch
                                            edge="start"
                                            checked={checked.indexOf(value) !== -1}
                                            tabIndex={-1}
                                            disableRipple
                                            inputProps={{ 'aria-labelledby': labelId }}
                                        />
                                    </ListItemIcon>
                                    <ListItemText id={labelId} primary={`Category ${value + 1}`} />
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
                </List>
            </Paper>
        </div>
    );
};