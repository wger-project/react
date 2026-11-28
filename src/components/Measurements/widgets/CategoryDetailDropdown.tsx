import MenuIcon from '@mui/icons-material/Menu';
import { Button, Menu, MenuItem } from "@mui/material";
import { DeleteConfirmationModal } from "@/core/ui/Modals/DeleteConfirmationModal";
import { FormQueryErrorsSnackbar } from "@/core/ui/Widgets/FormError";
import { WgerModal } from "@/core/ui/Modals/WgerModal";
import { categoryDisplayName, MeasurementCategory } from "@/components/Measurements/models/Category";
import { useDeleteMeasurementCategoryQuery } from "@/components/Measurements/queries";
import { CategoryForm } from "@/components/Measurements/widgets/CategoryForm";
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { makeLink, WgerLink } from "@/core/lib/url";

export const CategoryDetailDropdown = (props: { category: MeasurementCategory }) => {

    const deleteCategoryQuery = useDeleteMeasurementCategoryQuery(props.category.id!);
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
        deleteCategoryQuery.mutate(props.category.id!);
        navigate((makeLink(WgerLink.MEASUREMENT_OVERVIEW)));
    };


    const handleOpenEditModal = () => setOpenEditModal(true);
    const handleCloseEditModal = () => setOpenEditModal(false);
    const handleOpenDeleteModal = () => setOpenDeleteModal(true);
    const handleCloseDeleteModal = () => setOpenDeleteModal(false);


    return (
        <div>
            <FormQueryErrorsSnackbar mutationQuery={deleteCategoryQuery} />
            <Button onClick={handleClick}>
                <MenuIcon />
            </Button>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                slotProps={{
                    list: {
                        'aria-labelledby': 'basic-button',
                    },
                }}
            >
                <MenuItem onClick={handleEdit}>{t("edit")}</MenuItem>
                <MenuItem onClick={handleDelete}>{t("delete")}</MenuItem>
            </Menu>

            {/* Fixed height: the form grows with the calculation picked in it */}
            <WgerModal
                title={t('edit')}
                isOpen={openEditModal}
                closeFn={handleCloseEditModal}
                stableHeight
            >
                <CategoryForm category={props.category} closeFn={handleCloseEditModal} />
            </WgerModal>

            <DeleteConfirmationModal
                title={t('deleteConfirmation', { name: categoryDisplayName(props.category, t) })}
                message={t(props.category.isGroup ? 'measurements.deleteInfoGroup' : 'measurements.deleteInfo')}
                isOpen={openDeleteModal}
                closeFn={handleCloseDeleteModal}
                deleteFn={performDelete}
            />
        </div>
    );
};
