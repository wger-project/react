import MenuIcon from '@mui/icons-material/Menu';
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
import { Link, useNavigate } from "react-router-dom";
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
                <MenuIcon />
            </Button>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    'aria-labelledby': 'basic-button',
                }}
            >
                <MenuItem
                    component={Link}
                    to={makeLink(WgerLink.ROUTINE_EDIT, i18n.language, { id: props.routine.id })}>
                    {t("edit")}
                </MenuItem>
                <MenuItem
                    component={Link}
                    to={makeLink(WgerLink.ROUTINE_DETAIL_TABLE, i18n.language, { id: props.routine.id })}>
                    Table view
                </MenuItem>
                <MenuItem
                    component={Link}
                    to={makeLink(WgerLink.ROUTINE_LOGS_OVERVIEW, i18n.language, { id: props.routine.id })}>
                    {t("routines.logsOverview")}
                </MenuItem>
                <MenuItem
                    component={Link}
                    to={makeLink(WgerLink.ROUTINE_STATS_OVERVIEW, i18n.language, { id: props.routine.id })}>
                    {t("routines.statsOverview")}
                </MenuItem>
                <MenuItem
                    component="a"
                    href={makeLink(WgerLink.ROUTINE_COPY, i18n.language, { id: props.routine.id })}
                >
                    {t("routines.duplicate")}
                </MenuItem>
                <MenuItem
                    component="a"
                    href={makeLink(WgerLink.ROUTINE_PDF_TABLE, i18n.language, { id: props.routine.id })}
                    download={`Routine-${props.routine.id}-table.pdf`}>
                    {t("routines.downloadPdfTable")}
                </MenuItem>
                <MenuItem
                    component="a"
                    href={makeLink(WgerLink.ROUTINE_PDF_LOGS, i18n.language, { id: props.routine.id })}
                    download={`Routine-${props.routine.id}-logs.pdf`}>
                    {t("routines.downloadPdfLogs")}
                </MenuItem>
                <MenuItem
                    component="a"
                    href={makeLink(WgerLink.ROUTINE_ICAL, i18n.language, { id: props.routine.id })}
                    download={`Routine-${props.routine.id}-calendar.ics`}>
                    {t("routines.downloadIcal")}
                </MenuItem>
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
