import LandscapeIcon from '@mui/icons-material/Landscape';
import LandscapeOutlinedIcon from '@mui/icons-material/LandscapeOutlined';
import LandscapeTwoToneIcon from '@mui/icons-material/LandscapeTwoTone';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { Checkbox, FormControlLabel, Stack, Typography } from "@mui/material";
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { ImageStyle } from "@/components/Exercises/models/image";
import { useFieldContext } from "@/core/forms/formContexts";
import * as React from 'react';
import { useTranslation } from "react-i18next";

/** Bound to the form field it is rendered in via form.AppField */
export function ImageStyleToggle() {
    const [t] = useTranslation();
    const field = useFieldContext<number>();

    const handleAlignment = (
        event: React.MouseEvent<HTMLElement>,
        newStyle: number | null,
    ) => {
        if (newStyle === null) {
          return;
        }
        field.handleChange(newStyle);
    };

    return (
        <ToggleButtonGroup
            value={field.state.value}
            exclusive
            fullWidth
            onChange={handleAlignment}
            aria-label="text alignment"
        >
            <ToggleButton value={ImageStyle.PHOTO}>
                <Stack sx={{ justifyContent: "center", alignItems: "center" }}>
                    <PhotoCameraIcon />
                    <Typography variant="caption">{t('exercises.imageStylePhoto')}</Typography>
                </Stack>
            </ToggleButton>

            <ToggleButton value={ImageStyle.THREE_D}>
                <Stack sx={{ justifyContent: "center", alignItems: "center" }}>
                    <LandscapeIcon />
                    <Typography variant="caption">{t('exercises.imageStyle3D')}</Typography>
                </Stack>
            </ToggleButton>

            <ToggleButton value={ImageStyle.LINE_ART}>
                <Stack sx={{ justifyContent: "center", alignItems: "center" }}>
                    <LandscapeOutlinedIcon />
                    <Typography variant="caption">{t('exercises.imageStyleLine')}</Typography>
                </Stack>
            </ToggleButton>

            <ToggleButton value={ImageStyle.LOW_POLY}>
                <Stack sx={{ justifyContent: "center", alignItems: "center" }}>
                    <LandscapeTwoToneIcon />
                    <Typography variant="caption">{t('exercises.imageStyleLowPoly')}</Typography>
                </Stack>
            </ToggleButton>

            <ToggleButton value={ImageStyle.OTHER}>
                <Stack sx={{ justifyContent: "center", alignItems: "center" }}>
                    <MoreHorizIcon />
                    <Typography variant="caption">{t('exercises.imageStyleOther')}</Typography>
                </Stack>
            </ToggleButton>
        </ToggleButtonGroup>
    );
}

/** Bound to the form field it is rendered in via form.AppField */
export function ImageIsAiCheckbox() {
    const [t] = useTranslation();
    const field = useFieldContext<boolean>();

    return (
        <FormControlLabel
            control={
                <Checkbox
                    name={field.name}
                    checked={!!field.state.value}
                    onChange={(e) => field.handleChange(e.target.checked)}
                    data-testid="image-is-ai-checkbox"
                />
            }
            label={t('exercises.imageIsAiGenerated')}
        />
    );
}