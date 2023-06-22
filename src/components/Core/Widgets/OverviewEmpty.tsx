import React from "react";
import { Box, Typography } from "@mui/material";

export const OverviewEmpty = () => {

    return <>
        <Box sx={{
            height: "50vh",
            display: "flex",

            alignItems: "center",
            flexDirection: "column",
            justifyContent: "center",
        }}>
            <Typography variant="h6" mr={3}>
                Nothing here yet...
            </Typography>
            <Typography mr={3}>
                Press the action button to begin
            </Typography>
        </Box>
    </>;
};