import SettingsIcon from '@mui/icons-material/Settings';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    Menu,
    MenuItem
} from "@mui/material";
import { Routine } from "components/WorkoutRoutines/models/Routine";
import { useDeleteRoutineQuery } from "components/WorkoutRoutines/queries";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { makeLink, WgerLink } from "utils/url";


export const RoutineDetailDropdown = (props: { routine: Routine }) => {

    const navigate = useNavigate();
    const useDeleteQuery = useDeleteRoutineQuery(props.routine.id);

    const [t, i18n] = useTranslation();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);

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

    const handleDelete = () => {
        setDeleteConfirmationOpen(true);  // Open the confirmation dialog
        handleClose(); // Close the dropdown menu
    };

    const handleConfirmDelete = async () => {
        await useDeleteQuery.mutateAsync();
        navigate(makeLink(WgerLink.ROUTINE_OVERVIEW, i18n.language));
    };

    const handleCancelDelete = () => {
        setDeleteConfirmationOpen(false);
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
                <Divider />
                <MenuItem onClick={handleDelete}>{t("delete")}</MenuItem>
            </Menu>

            <Dialog
                open={deleteConfirmationOpen}
                onClose={handleCancelDelete}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {t('delete')}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        {t('deleteConfirmation', { name: props.routine.name })}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelDelete}>
                        {t("cancel")}
                    </Button>
                    <Button onClick={handleConfirmDelete} color="error" autoFocus>
                        {t("delete")}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};
