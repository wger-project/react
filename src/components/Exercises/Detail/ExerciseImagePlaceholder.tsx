import PhotoIcon from "@mui/icons-material/Photo";
import { Box } from "@mui/material";
import React from "react";

export const ExerciseImagePlaceholder = (props: {
    backgroundColor?: string | undefined,
    iconColor?: string | undefined,
    height?: number | undefined,
}) => {

    const backgroundColor = props.backgroundColor || "lightgray";
    const iconColor = props.iconColor || "gray";
    const height = props.height || 200;

    return <Box sx={{ backgroundColor: backgroundColor, height: height }}
                display="flex"
                alignItems="center"
                justifyContent="center">
        <PhotoIcon sx={{ fontSize: 80, color: iconColor }} />
    </Box>;
};