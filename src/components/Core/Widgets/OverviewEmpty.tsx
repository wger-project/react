import { Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

export const OverviewEmpty = (props: { height?: string }) => {
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
    </>;
};