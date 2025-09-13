import { Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import React from "react";

export const OverviewEmpty = (props: { height?: string; fabRef?: React.RefObject<HTMLElement> }) => {
    const [t] = useTranslation();

    const height = props.height ? props.height : "50vh";

    // add console log to test
    React.useEffect(() => {
        console.log('fabRef:', props.fabRef);
        console.log('fabRef.current:', props.fabRef?.current);
    }, [props.fabRef]);

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

        {/* curved arrow */}
        <Box
            component="svg"
            sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: 1000,
                pointerEvents: 'none',
                animation: 'arrowPulse 2.5s infinite ease-in-out',
                '@keyframes arrowPulse': {
                    '0%': { opacity: 0.8 },
                    '50%': { opacity: 0.4 },
                    '100%': { opacity: 0.8 },
                },
            }}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
        >
            {/* arrow tail - from the text area, pointing to add button */}
            <path
                d="M 45 45 Q 70 25, 90 85"
                stroke="#1976d2"
                strokeWidth="0.8"
                fill="none"
                strokeDasharray="3,2"
                strokeLinecap="round"
                style={{
                    filter: 'drop-shadow(0 0.2vw 0.4vw rgba(0,0,0,0.3))'
                }}
            />

            {/* arrow tip */}
            <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    zIndex: 1000,
                    pointerEvents: 'none',
                }}
            >
                <defs>
                    <marker
                        id="arrowhead"
                        markerWidth="4"
                        markerHeight="4"
                        refX="2"
                        refY="2"
                        orient="auto"
                    >
                        <polygon points="0 0, 4 2, 0 4" fill="#1976d2" />
                    </marker>
                </defs>

                <path
                    d="M 45 45 Q 70 25, 90 85"
                    stroke="#1976d2"
                    strokeWidth="0.8"
                    fill="none"
                    strokeDasharray="3,2"
                    strokeLinecap="round"
                    style={{ filter: 'drop-shadow(0 0.2vw 0.4vw rgba(0,0,0,0.3))' }}
                    markerEnd="url(#arrowhead)"
                />
            </svg>
        </Box>
    </>;
};