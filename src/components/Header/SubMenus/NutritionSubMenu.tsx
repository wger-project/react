import { Link } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import { Button, Menu, MenuItem } from "@mui/material";
import { makeLink, WgerLink } from "utils/url";
import React from "react";

export const NutritionSubMenu = () => {

    const { i18n } = useTranslation();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    return (
        <>
            <Button color="inherit" onClick={(event) => setAnchorEl(event.currentTarget)}>
                Nutrition
            </Button>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
            >
                <MenuItem component={Link} to={makeLink(WgerLink.NUTRITION_OVERVIEW, i18n.language)}>
                    Overview
                </MenuItem>
            </Menu>
        </>
    );
};
