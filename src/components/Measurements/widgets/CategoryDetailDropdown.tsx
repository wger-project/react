import MenuIcon from '@mui/icons-material/Menu';
import { Button, Menu, MenuItem } from "@mui/material";
import { DeleteConfirmationModal } from "components/Core/Modals/DeleteConfirmationModal";
import { WgerModal } from "components/Core/Modals/WgerModal";
import { MeasurementCategory } from "components/Measurements/models/Category";
import { useDeleteMeasurementCategoryQuery } from "components/Measurements/queries";
import { CategoryForm } from "components/Measurements/widgets/CategoryForm";
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { makeLink, WgerLink } from "utils/url";

export const CategoryDetailDropdown = (props: { category: MeasurementCategory }) => {

    const deleteCategoryQuery = useDeleteMeasurementCategoryQuery(props.category.id);
    const navigate = useNavigate();

    const [t] = useTranslation();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const [openEditModal, setOpenEditModal] = React.useState(false);
    const [openDeleteModal, setOpenDeleteModal] = React.useState(false);
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
        deleteCategoryQuery.mutate(props.category.id);
        navigate((makeLink(WgerLink.MEASUREMENT_OVERVIEW)));
    };


    const handleOpenEditModal = () => setOpenEditModal(true);
    const handleCloseEditModal = () => setOpenEditModal(false);
    const handleOpenDeleteModal = () => setOpenDeleteModal(true);
    const handleCloseDeleteModal = () => setOpenDeleteModal(false);


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
                <MenuItem onClick={handleEdit}>{t("edit")}</MenuItem>
                <MenuItem onClick={handleDelete}>{t("delete")}</MenuItem>
            </Menu>

            <WgerModal title={t('edit')} isOpen={openEditModal} closeFn={handleCloseEditModal}>
                <CategoryForm category={props.category} closeFn={handleCloseEditModal} />
            </WgerModal>

            <DeleteConfirmationModal
                title={t('deleteConfirmation', { name: props.category.name })}
                message={t('measurements.deleteInfo')}
                isOpen={openDeleteModal}
                closeFn={handleCloseDeleteModal}
                deleteFn={performDelete}
            />
        </div>
    );
};
