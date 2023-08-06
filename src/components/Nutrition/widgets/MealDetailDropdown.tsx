import HistoryEduIcon from "@mui/icons-material/HistoryEdu";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Alert, IconButton, Menu, MenuItem, Snackbar } from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import { DeleteConfirmationModal } from "components/Core/Modals/DeleteConfirmationModal";
import { WgerModal } from "components/Core/Modals/WgerModal";
import { Meal } from "components/Nutrition/models/meal";
import { useDeleteMealQuery } from "components/Nutrition/queries";
import { useAddDiaryEntriesQuery } from "components/Nutrition/queries/diary";
import { MealForm } from "components/Nutrition/widgets/forms/MealForm";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { SNACKBAR_AUTO_HIDE_DURATION } from "utils/consts";


export const MealDetailDropdown = (props: { meal: Meal, planId: number }) => {

    const addDiaryEntriesQuery = useAddDiaryEntriesQuery(props.planId);
    const deleteMealQuery = useDeleteMealQuery(props.planId);

    const [t] = useTranslation();
    const [openSnackbar, setOpenSnackbar] = React.useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
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
        deleteMealQuery.mutate(props.meal.id);
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
        const diaryData = props.meal.items.map(item => {
            return {
                plan: props.planId,
                meal: props.meal.id,
                mealItem: item.id,
                ingredient: item.ingredientId,
                // eslint-disable-next-line camelcase
                weight_unit: item.weightUnitId,
                datetime: (new Date()).toISOString(),
                amount: item.amount
            };
        });
        addDiaryEntriesQuery.mutate(diaryData);
        setOpenSnackbar(true);
    };


    return <>
        <Tooltip title={t('nutrition.logThisMeal')}>
            <IconButton aria-label="settings" onClick={handleAddDiaryEntry}>
                <HistoryEduIcon />
            </IconButton>
        </Tooltip>
        <IconButton aria-label="settings" onClick={handleClick}>
            <MoreVertIcon />
        </IconButton>
        <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            MenuListProps={{
                'aria-labelledby': 'basic-button',
            }}
        >
            <MenuItem onClick={handleEdit}>{t("edit")}</MenuItem>
            <MenuItem onClick={handleDelete}>{t("delete")}</MenuItem>
        </Menu>

        <WgerModal title={t('edit')} isOpen={openEditModal} closeFn={handleCloseEditModal}>
            <MealForm meal={props.meal} closeFn={handleCloseEditModal} planId={props.planId} />
        </WgerModal>

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
