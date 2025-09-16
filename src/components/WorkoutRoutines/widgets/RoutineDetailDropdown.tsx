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
import { RoutineTemplateForm } from "components/WorkoutRoutines/widgets/forms/RoutineTemplateForm";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { makeLink, WgerLink } from "utils/url";


export enum DialogToOpen {
    NONE,
    DELETE_CONFIRMATION,
    EDIT_TEMPLATE
}

export const RoutineDetailDropdown = (props: { routine: Routine }) => {

    const navigate = useNavigate();
    const useDeleteQuery = useDeleteRoutineQuery(props.routine.id!);

    const [t, i18n] = useTranslation();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [deleteConfirmationOpen, setConfirmationOpen] = useState<DialogToOpen>(DialogToOpen.NONE);

    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleDelete = () => {
        setConfirmationOpen(DialogToOpen.DELETE_CONFIRMATION);
        handleClose(); // Close the dropdown menu
    };

    const handleTemplate = () => {
        setConfirmationOpen(DialogToOpen.EDIT_TEMPLATE);
        handleClose();
    };

    const handleConfirmDelete = async () => {
        await useDeleteQuery.mutateAsync();
        navigate(makeLink(WgerLink.ROUTINE_OVERVIEW, i18n.language));
    };

    const handleCloseDialogs = () => {
        setConfirmationOpen(DialogToOpen.NONE);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    /*
     *  Note: this is a workaround. Instead of just using the navigate function we need to
     *        force a reload of the page, otherwise the drag-and-drop doesn't work properly
     *        when loaded from within the django application. This has probably to do with
     *        the way we add the components there. If we find a solution for that one day,
     *        this can be removed.
     *
     *        See also: https://github.com/wger-project/wger/issues/1943
     */
    const navigateEdit = () => window.location.href = makeLink(
        WgerLink.ROUTINE_EDIT,
        i18n.language,
        { id: props.routine.id! }
    );


    return (
        <div>
            <Button onClick={handleClick}>
                <MenuIcon />
            </Button>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
            >
                <MenuItem
                    // disabled={props.routine.isTemplate}
                    onClick={navigateEdit}>
                    {t("edit")}
                </MenuItem>
                <MenuItem
                    component={Link}
                    to={makeLink(WgerLink.ROUTINE_DETAIL_TABLE, i18n.language, { id: props.routine.id! })}>
                    Table view
                </MenuItem>
                {props.routine.isNotTemplate && <MenuItem
                    component={Link}
                    to={makeLink(WgerLink.ROUTINE_LOGS_OVERVIEW, i18n.language, { id: props.routine.id! })}>
                    {t("routines.logsOverview")}
                </MenuItem>}
                {props.routine.isNotTemplate && <MenuItem
                    component={Link}
                    to={makeLink(WgerLink.ROUTINE_STATS_OVERVIEW, i18n.language, { id: props.routine.id! })}>
                    {t("routines.statsOverview")}
                </MenuItem>}
                <MenuItem
                    component="a"
                    href={makeLink(WgerLink.ROUTINE_COPY, i18n.language, { id: props.routine.id! })}
                >
                    {t("routines.duplicate")}
                </MenuItem>
                <MenuItem onClick={handleTemplate}>
                    {t("routines.markAsTemplate")}
                </MenuItem>
                <MenuItem
                    component="a"
                    href={makeLink(WgerLink.ROUTINE_PDF_TABLE, i18n.language, { id: props.routine.id! })}
                    download={`Routine-${props.routine.id}-table.pdf`}>
                    {t("routines.downloadPdfTable")}
                </MenuItem>
                <MenuItem
                    component="a"
                    href={makeLink(WgerLink.ROUTINE_PDF_LOGS, i18n.language, { id: props.routine.id! })}
                    download={`Routine-${props.routine.id}-logs.pdf`}>
                    {t("routines.downloadPdfLogs")}
                </MenuItem>
                <MenuItem
                    component="a"
                    href={makeLink(WgerLink.ROUTINE_ICAL, i18n.language, { id: props.routine.id! })}
                    download={`Routine-${props.routine.id}-calendar.ics`}>
                    {t("routines.downloadIcal")}
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleDelete}>{t("delete")}</MenuItem>
            </Menu>

            <Dialog
                open={deleteConfirmationOpen === DialogToOpen.DELETE_CONFIRMATION}
                onClose={handleCloseDialogs}
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
                    <Button onClick={handleCloseDialogs}>
                        {t("cancel")}
                    </Button>
                    <Button onClick={handleConfirmDelete} color="error" autoFocus>
                        {t("delete")}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={deleteConfirmationOpen === DialogToOpen.EDIT_TEMPLATE}
                onClose={handleCloseDialogs}
            >
                <DialogTitle>
                    {t("routines.markAsTemplate")}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        <RoutineTemplateForm routine={props.routine} />
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialogs}>
                        {t("close")}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};
