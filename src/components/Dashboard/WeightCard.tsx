import { Button, Card, CardActions, CardContent, CardHeader, } from '@mui/material';
import React from 'react';
import { t } from "i18next";
import { useStateValue } from "state";
import { BodyWeight } from "components/BodyWeight";

export const WeightCard = () => {

    const [state, dispatch] = useStateValue();
    return (
        <Card>
            <CardHeader title={t('weight')} />
            <CardContent>
                <p>{t('current-weight')}</p>
                <BodyWeight />
            </CardContent>
            <CardActions>
                <Button size="small">{t('add-entry')}</Button>
            </CardActions>
        </Card>
    );
};