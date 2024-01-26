import PhotoIcon from "@mui/icons-material/Photo";
import { Avatar } from "@mui/material";
import { ExerciseImage } from "components/Exercises/models/image";
import React from "react";

export const ExerciseImageAvatar = (props: {
    image: ExerciseImage | undefined,
    iconSize?: number | undefined,
    avatarSize?: number | undefined,
}) => {
    const avatarSize = props.avatarSize || 40;
    const iconSize = props.iconSize || 40;

    return <Avatar
        sx={{ height: avatarSize, width: avatarSize, }}
        src={props.image?.url}
    >
        <PhotoIcon sx={{ height: iconSize, width: iconSize }} />
    </Avatar>;
};