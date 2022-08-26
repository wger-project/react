import React from 'react';
import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";

export const LoadingWidget = () => {

    const [t] = useTranslation();

    return (
        <Box sx={{ textAlign: "center" }}>{t('loading')}</Box>
    );
};