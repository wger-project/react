import MenuIcon from '@mui/icons-material/Menu';
import { Button, Menu, MenuItem } from "@mui/material";
import { makeLink, WgerLink } from "@/core/lib/url";
import React, { useId, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export const RoutineOverviewDropdown = () => {
    const [t, i18n] = useTranslation();
    const [anchor, setAnchor] = useState<HTMLElement | null>(null);
    const id = useId();

    return <>
        <Button
            id={`${id}-button`}
            aria-label={t('routines.analytics.menu')}
            aria-haspopup="menu"
            aria-expanded={anchor !== null}
            aria-controls={anchor ? `${id}-menu` : undefined}
            onClick={event => setAnchor(event.currentTarget)}>
            <MenuIcon />
        </Button>
        <Menu
            id={`${id}-menu`}
            anchorEl={anchor}
            open={anchor !== null}
            onClose={() => setAnchor(null)}
            slotProps={{ list: { 'aria-labelledby': `${id}-button` } }}>
            <MenuItem
                component={Link}
                to={makeLink(WgerLink.EXERCISE_ANALYTICS, i18n.language)}
                onClick={() => setAnchor(null)}>
                {t('routines.analytics.title')}
            </MenuItem>
        </Menu>
    </>;
};
