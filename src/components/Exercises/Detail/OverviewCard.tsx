import React from 'react';
import { Button, Card, CardActions, CardContent, Typography } from "@mui/material";

export const OverviewCard = () => {

    return (
        <Card sx={{ minWidth: 275 }}>
            <CardContent>
                <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                    Exercise 123
                </Typography>
                <Typography variant="h5" component="div">
                    Name here
                </Typography>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                    equipment, etc. etc.
                </Typography>
                <Typography variant="body2">
                    Image and so on

                </Typography>
            </CardContent>
            <CardActions>
                <Button size="small">Click for details</Button>
            </CardActions>
        </Card>
    );
};