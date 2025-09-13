import { Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import React from "react";

export const OverviewEmpty = (props: { height?: string; fabRef?: React.RefObject<HTMLElement> }) => {
    const [t] = useTranslation();

    const height = props.height ? props.height : "50vh";

    return <>
        <Box sx={{
            height: height,
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
            justifyContent: "center",
        }}>
            <Typography variant="h6" mr={3}>
                {t('nothingHereYet')}
            </Typography>
            <Typography mr={3}>
                {t('nothingHereYetAction')}
            </Typography>
        </Box>

        {/* arrow pointing to fab*/}
        {props.fabRef && props.fabRef.current && (
            <Box
                sx={{
                    position: 'fixed',
                    bottom: '8rem', 
                    right: '5rem', 
                    zIndex: 8,
                    width: 0,
                    height: 0,
                    borderLeft: '12px solid rgba(25, 118, 210, 0.9)', 
                    borderTop: '10px solid transparent',
                    borderBottom: '10px solid transparent',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))', 
                }}
            />
        )}
    </>;
};