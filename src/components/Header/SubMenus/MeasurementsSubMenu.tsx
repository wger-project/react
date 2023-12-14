import { Link } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import { Button, Menu, MenuItem } from "@mui/material";
import { makeLink, WgerLink } from "utils/url";
import React from "react";

export const MeasurementsSubMenu = () => {

    const { i18n } = useTranslation();
    const [anchorElMeasurements, setAnchorElMeasurements] = React.useState<null | HTMLElement>(null);

    return (
        <>
            <Button color="inherit" onClick={(event) => setAnchorElMeasurements(event.currentTarget)}>
                Measurements
            </Button>
            <Menu
                anchorEl={anchorElMeasurements}
                open={Boolean(anchorElMeasurements)}
                onClose={() => setAnchorElMeasurements(null)}
            >
                <MenuItem component={Link} to={makeLink(WgerLink.MEASUREMENT_OVERVIEW, i18n.language)}>
                    Overview
                </MenuItem>
            </Menu>
        </>
    );
};
