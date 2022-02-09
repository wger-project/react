import React from 'react';
import { Button, Card, CardActions, CardContent, CardMedia, Typography } from "@mui/material";

export const OverviewCard = () => {

    return (
        <Card>
            <CardMedia
                component="img"
                image="https://mui.com/static/images/cards/contemplative-reptile.jpg"
                alt="green iguana"
            />
            <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                    Exercise name
                </Typography>
                <Typography color="text.secondary">
                    equipment, etc. etc.
                </Typography>
            </CardContent>
            <CardActions>
                <Button size="small">Click for details</Button>
            </CardActions>
        </Card>
    );
};