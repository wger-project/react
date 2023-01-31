import React from 'react';
import { Box, CircularProgress, Paper, Stack } from "@mui/material";
import { useTranslation } from "react-i18next";

export const LoadingWidget = () => {

    const [t] = useTranslation();

    return (
        <Box sx={{ textAlign: "center" }}>{t('loading')}</Box>
    );
};

export const LoadingPlaceholder = () => {
    return <Paper
        sx={{ height: 200, alignItems: "center", mt: 2 }}
        component={Stack}
        direction="column"
        justifyContent="center">
        <CircularProgress />
    </Paper>;
};