import React from 'react';
import { Card, CardActionArea, CardContent, CardMedia, Typography } from "@mui/material";

export const OverviewCard = () => {

    return (
        <Card>
            <CardActionArea>
                <CardMedia
                    component="img"
                    image="https://mui.com/static/images/cards/contemplative-reptile.jpg"
                    alt="green iguana"
                />
                <CardContent>
                    <Typography gutterBottom variant="h6" component="div">
                        Exercise name
                    </Typography>
                    <Typography color="text.secondary">
                        barbell, bench
                    </Typography>
                </CardContent>
            </CardActionArea>
        </Card>
    );
};