import { Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

export const OverviewEmpty = () => {
    const [t] = useTranslation();

    return <>
        <Box sx={{
            height: "50vh",
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
    </>;
};