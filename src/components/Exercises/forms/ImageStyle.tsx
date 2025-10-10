import LandscapeIcon from '@mui/icons-material/Landscape';
import LandscapeOutlinedIcon from '@mui/icons-material/LandscapeOutlined';
import LandscapeTwoToneIcon from '@mui/icons-material/LandscapeTwoTone';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { Stack, Typography } from "@mui/material";
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { ImageStyle } from "components/Exercises/models/image";
import { useField } from "formik";
import * as React from 'react';
import { useTranslation } from "react-i18next";

export function ImageStyleToggle(props: { fieldName: string }) {
    const [t] = useTranslation();

    const [style, setStyle] = React.useState<number | null>(ImageStyle.PHOTO);

    const [, , helpers] = useField(props.fieldName);


    const handleAlignment = (
        event: React.MouseEvent<HTMLElement>,
        newStyle: number | null,
    ) => {
        setStyle(newStyle);
        helpers.setValue(newStyle);
    };

    return (
        <ToggleButtonGroup
            value={style}
            exclusive
            fullWidth
            onChange={handleAlignment}
            aria-label="text alignment"
        >
            <ToggleButton value={ImageStyle.PHOTO}>
                <Stack justifyContent="center" alignItems="center">
                    <PhotoCameraIcon />
                    <Typography variant="caption">{t('exercises.imageStylePhoto')}</Typography>
                </Stack>
            </ToggleButton>

            <ToggleButton value={ImageStyle.THREE_D}>
                <Stack justifyContent="center" alignItems="center">
                    <LandscapeIcon />
                    <Typography variant="caption">{t('exercises.imageStyle3D')}</Typography>
                </Stack>
            </ToggleButton>

            <ToggleButton value={ImageStyle.LINE_ART}>
                <Stack justifyContent="center" alignItems="center">
                    <LandscapeOutlinedIcon />
                    <Typography variant="caption">{t('exercises.imageStyleLine')}</Typography>
                </Stack>
            </ToggleButton>

            <ToggleButton value={ImageStyle.LOW_POLY}>
                <Stack justifyContent="center" alignItems="center">
                    <LandscapeTwoToneIcon />
                    <Typography variant="caption">{t('exercises.imageStyleLowPoly')}</Typography>
                </Stack>
            </ToggleButton>

            <ToggleButton value={ImageStyle.OTHER}>
                <Stack justifyContent="center" alignItems="center">
                    <MoreHorizIcon />
                    <Typography variant="caption">{t('exercises.imageStyleOther')}</Typography>
                </Stack>
            </ToggleButton>
        </ToggleButtonGroup>
    );
}