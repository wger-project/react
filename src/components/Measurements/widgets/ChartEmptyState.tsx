import { Box, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";

/** Shown in place of a chart that has nothing to draw */
export const ChartEmptyState = (props: { height?: number }) => {
    const [t] = useTranslation();

    return <Box sx={{
        alignItems: 'center',
        display: 'flex',
        height: props.height ?? 200,
        justifyContent: 'center',
    }}>
        <Typography color="text.secondary">{t('measurements.noDataAvailable')}</Typography>
    </Box>;
};
