import { Button, Card, CardActions, CardContent, CardHeader, Skeleton, } from '@mui/material';
import React from 'react';
import { useTranslation } from "react-i18next";

export const WorkoutCard = () => {

    const [t] = useTranslation();

    return (
        <Card>
            <CardHeader title={t('workout')} />
            <CardContent>
                <Skeleton animation={false} />
                <Skeleton variant="text" animation={false} />
                <Skeleton variant="circular" width={40} height={40} animation={false} />
                <Skeleton variant="rectangular" height={118} animation={false} />
                <p>Content goes here</p>
            </CardContent>
            <CardActions>
                <Button size="small">{t('addEntry')}</Button>
            </CardActions>
        </Card>
    );
};