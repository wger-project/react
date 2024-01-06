import LandscapeIcon from '@mui/icons-material/Landscape';
import LandscapeOutlinedIcon from '@mui/icons-material/LandscapeOutlined';
import LandscapeTwoToneIcon from '@mui/icons-material/LandscapeTwoTone';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { Stack, Typography } from "@mui/material";
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import * as React from 'react';
import { useTranslation } from "react-i18next";

export function ImageStyleToggle(props: { fieldName: string }) {
    const [t] = useTranslation();

    const [alignment, setAlignment] = React.useState<string | null>('left');

    const handleAlignment = (
        event: React.MouseEvent<HTMLElement>,
        newAlignment: string | null,
    ) => {
        setAlignment(newAlignment);
    };

    return (
        <ToggleButtonGroup
            value={alignment}
            exclusive
            fullWidth
            onChange={handleAlignment}
            aria-label="text alignment"
        >
            <ToggleButton value="photo" aria-label="left aligned">
                <Stack justifyContent="center" alignItems="center">
                    <PhotoCameraIcon />
                    <Typography variant="caption">{t('exercises.imageStylePhoto')}</Typography>
                </Stack>
            </ToggleButton>

            <ToggleButton value="3d" aria-label="centered">
                <Stack justifyContent="center" alignItems="center">
                    <LandscapeIcon />
                    <Typography variant="caption">{t('exercises.imageStyle3D')}</Typography>
                </Stack>

            </ToggleButton>

            <ToggleButton value="line" aria-label="right aligned">
                <Stack justifyContent="center" alignItems="center">
                    <LandscapeOutlinedIcon />
                    <Typography variant="caption">{t('exercises.imageStyleLine')}</Typography>
                </Stack>

            </ToggleButton>

            <ToggleButton value="low-poly" aria-label="justified">
                <Stack justifyContent="center" alignItems="center">
                    <LandscapeTwoToneIcon />
                    <Typography variant="caption">{t('exercises.imageStyleLowPoly')}</Typography>
                </Stack>

            </ToggleButton>

            <ToggleButton value="other" aria-label="justified">
                <Stack justifyContent="center" alignItems="center">
                    <MoreHorizIcon />
                    <Typography variant="caption">{t('exercises.imageStyleOther')}</Typography>
                </Stack>
            </ToggleButton>
        </ToggleButtonGroup>
    );
}