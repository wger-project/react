import { useTranslation } from "react-i18next";
import { IconButton, Menu, MenuItem } from "@mui/material";
import { useDeleteMealQuery } from "components/Nutrition/queries";
import { Meal } from "components/Nutrition/models/meal";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useState } from "react";
import { WgerModal } from "components/Core/Modals/WgerModal";
import { MealForm } from "components/Nutrition/widgets/forms/MealForm";
import { DeleteConfirmationModal } from "components/Core/Modals/DeleteConfirmationModal";


export const MealDetailDropdown = (props: { meal: Meal, planId: number }) => {

    const deleteMealQuery = useDeleteMealQuery(props.planId);

    const [t] = useTranslation();
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


    return <>
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
    </>;
};
