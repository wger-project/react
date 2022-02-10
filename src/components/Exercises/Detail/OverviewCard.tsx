import React from 'react';
import { Card, CardActionArea, CardContent, CardMedia, Typography } from "@mui/material";
import { ExerciseBase } from "components/Exercises/models/exerciseBase";

type OverviewCardProps = {
    exerciseBase: ExerciseBase;
}


export const OverviewCard = ({ exerciseBase }: OverviewCardProps) => {

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
                        ID: {exerciseBase.id}
                    </Typography>
                    <Typography color="text.secondary">
                        {exerciseBase.category.name} /
                        {exerciseBase.equipment.map(e => e.name).join(', ')}
                    </Typography>
                </CardContent>
            </CardActionArea>
        </Card>
    );
};