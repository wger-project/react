import HistoryEduIcon from "@mui/icons-material/HistoryEdu";
import InfoIcon from '@mui/icons-material/Info';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Alert, IconButton, Menu, MenuItem, Snackbar } from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import { DeleteConfirmationModal } from "@/core/ui/Modals/DeleteConfirmationModal";
import { FormQueryErrorsSnackbar } from "@/core/ui/Widgets/FormError";
import { WgerModal } from "@/core/ui/Modals/WgerModal";
import { Meal } from "@/components/Nutrition/models/meal";
import { useDeleteMealQuery } from "@/components/Nutrition/queries";
import { useAddDiaryEntriesQuery } from "@/components/Nutrition/queries/diary";
import { MealForm } from "@/components/Nutrition/widgets/forms/MealForm";
import { MealLogForm } from "./forms/MealLogForm";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { SNACKBAR_AUTO_HIDE_DURATION } from "@/core/lib/consts";


export const MealDetailDropdown = (props: {
    meal: Meal,
    planId: string,
    onlyLogging: boolean,
    isExpanded: boolean,
    handleExpanded: () => void,
}) => {

    const addDiaryEntriesQuery = useAddDiaryEntriesQuery(props.planId);
    const deleteMealQuery = useDeleteMealQuery(props.planId);

    const [t] = useTranslation();
    const [openSnackbar, setOpenSnackbar] = React.useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [openLogModal, setOpenLogModal] = useState(false);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleEdit = () => {
        handleClose();
        handleOpenEditModal();
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleDelete = () => {
        handleOpenDeleteModal();
        setAnchorEl(null);
    };

    const performDelete = () => {
        deleteMealQuery.mutate(props.meal.id!);
    };


    const handleOpenEditModal = () => setOpenEditModal(true);
    const handleCloseEditModal = () => setOpenEditModal(false);
    const handleOpenDeleteModal = () => setOpenDeleteModal(true);
    const handleCloseDeleteModal = () => setOpenDeleteModal(false);

    const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenSnackbar(false);
    };


    const handleAddDiaryEntry = () => {
        const diaryEntries = props.meal.items.map(item => item.diaryEntry(props.planId));
        addDiaryEntriesQuery.mutate(diaryEntries, { onSuccess: () => setOpenSnackbar(true) });
    };


    return <>
        <FormQueryErrorsSnackbar mutationQuery={deleteMealQuery} />
        <FormQueryErrorsSnackbar mutationQuery={addDiaryEntriesQuery} />
        {props.meal.isRealMeal && !props.onlyLogging && <Tooltip title={t('nutrition.logThisMeal')}>
            <IconButton aria-label={t('nutrition.logThisMeal')} onClick={handleAddDiaryEntry}
                        disabled={addDiaryEntriesQuery.isPending || props.meal.items.length === 0}>
                <HistoryEduIcon />
            </IconButton>
        </Tooltip>}
        {props.meal.isRealMeal && <IconButton aria-label={t('nutrition.mealActions')} onClick={handleClick}>
            <MoreVertIcon />
        </IconButton>}
        <IconButton aria-label="settings" onClick={props.handleExpanded}>
            {props.isExpanded ? <InfoIcon /> : <InfoOutlinedIcon />}
        </IconButton>
        <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
        >
            {!props.onlyLogging && <MenuItem
                disabled={props.meal.items.length === 0 || addDiaryEntriesQuery.isPending}
                onClick={() => {
                    handleClose();
                    setOpenLogModal(true);
                }}
            >{t('nutrition.adjustAndLog')}</MenuItem>}
            <MenuItem onClick={handleEdit}>{t("edit")}</MenuItem>
            <MenuItem onClick={handleDelete}>{t("delete")}</MenuItem>
        </Menu>

        <WgerModal title={t('edit')} isOpen={openEditModal} closeFn={handleCloseEditModal}>
            <MealForm meal={props.meal} closeFn={handleCloseEditModal} planId={props.planId} />
        </WgerModal>

        {openLogModal && <WgerModal
            title={t('nutrition.adjustAndLog')}
            subtitle={props.meal.displayName ?? undefined}
            isOpen={openLogModal}
            closeFn={() => setOpenLogModal(false)}
        >
            <MealLogForm meal={props.meal} planId={props.planId}
                         closeFn={() => setOpenLogModal(false)} onSuccess={() => setOpenSnackbar(true)} />
        </WgerModal>}

        <DeleteConfirmationModal
            title={t('deleteConfirmation', { name: props.meal.name })}
            message={t('nutrition.mealDeleteInfo')}
            isOpen={openDeleteModal}
            closeFn={handleCloseDeleteModal}
            deleteFn={performDelete}
        />

        <Snackbar open={openSnackbar} autoHideDuration={SNACKBAR_AUTO_HIDE_DURATION} onClose={handleCloseSnackbar}>
            <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
                {t('nutrition.diaryEntrySaved')}
            </Alert>
        </Snackbar>
    </>;
};
