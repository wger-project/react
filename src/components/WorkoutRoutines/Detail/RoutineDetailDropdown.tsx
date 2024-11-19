import SettingsIcon from '@mui/icons-material/Settings';
import { Button, Menu, MenuItem } from "@mui/material";
import { Routine } from "components/WorkoutRoutines/models/Routine";
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { makeLink, WgerLink } from "utils/url";


export const RoutineDetailDropdown = (props: { routine: Routine }) => {

    const navigate = useNavigate();

    const [t, i18n] = useTranslation();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleEdit = () => {
        navigate(makeLink(WgerLink.ROUTINE_EDIT, i18n.language, { id: props.routine.id }));
    };

    const handleTable = () => {
        navigate(makeLink(WgerLink.ROUTINE_DETAIL_TABLE, i18n.language, { id: props.routine.id }));
    };

    const handleClose = () => {
        setAnchorEl(null);
    };


    return (
        <div>
            <Button onClick={handleClick}>
                <SettingsIcon />
            </Button>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    'aria-labelledby': 'basic-button',
                }}
            >
                <MenuItem onClick={handleEdit}>{t("edit")}</MenuItem>
                <MenuItem onClick={handleTable}>Table view</MenuItem>
                {/*<MenuItem onClick={handleDelete}>{t("delete")}</MenuItem>*/}
            </Menu>
        </div>
    );
};
