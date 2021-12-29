import React from 'react';
import { ProcessedWeight } from '..';
import { Button, Menu, MenuItem } from "@mui/material";
import { Trans } from "react-i18next";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

interface ActionButtonProps {
    weight: ProcessedWeight
}

export const ActionButton = ({ weight }: ActionButtonProps) => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <div>
            <Button onClick={handleClick}>
                <ArrowDropDownIcon/>
            </Button>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    'aria-labelledby': 'basic-button',
                }}
            >
                <MenuItem onClick={handleClose}><Trans i18nKey={"edit"}/></MenuItem>
                <MenuItem onClick={handleClose}><Trans i18nKey={"delete"}/></MenuItem>
            </Menu>
        </div>
    );
};
