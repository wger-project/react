import { Link } from 'react-router-dom';
import { Button, Menu, MenuItem } from "@mui/material";
import { makeLink, WgerLink } from "utils/url";
import React from "react";
import { useTranslation } from "react-i18next";

export const BodyWeightSubMenu = () => {
    const { i18n } = useTranslation();
    const [anchorElWeight, setAnchorElWeight] = React.useState<null | HTMLElement>(null);

    return (
        <>
            <Button color="inherit" onClick={(event) => setAnchorElWeight(event.currentTarget)}>
                Weight
            </Button>
            <Menu
                anchorEl={anchorElWeight}
                open={Boolean(anchorElWeight)}
                onClose={() => setAnchorElWeight(null)}
            >
                <MenuItem component={Link} to={makeLink(WgerLink.WEIGHT_OVERVIEW, i18n.language)}>
                    Weight overview
                </MenuItem>
                <MenuItem component={Link} to={makeLink(WgerLink.WEIGHT_ADD, i18n.language)}>
                    Add weight entry
                </MenuItem>
            </Menu>
        </>
    );
};
