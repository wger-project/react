import { Box, CircularProgress, Stack } from "@mui/material";
import React from 'react';
import { useTranslation } from "react-i18next";

export const LoadingWidget = () => {
    const [t] = useTranslation();

    return (
        <Box sx={{ textAlign: "center" }}>{t('loading')}</Box>
    );
};

export const LoadingPlaceholder = () => <Box
    sx={{ height: 200, alignItems: "center", mt: 2 }}
    component={Stack}
    direction="column"
    justifyContent="center">
    <CircularProgress />
</Box>;


export const LoadingProgressIcon = () => <CircularProgress size={20} />;