import MenuIcon from '@mui/icons-material/Menu';
import { Button, Menu, MenuItem } from "@mui/material";
import { DeleteConfirmationModal } from "components/Core/Modals/DeleteConfirmationModal";
import { WgerModal } from "components/Core/Modals/WgerModal";
import { NutritionalPlan } from "components/Nutrition/models/nutritionalPlan";
import { useDeleteNutritionalPlanQuery } from "components/Nutrition/queries";
import { PlanForm } from "components/Nutrition/widgets/forms/PlanForm";
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { makeLink, WgerLink } from "utils/url";


export const PlanDetailDropdown = (props: { plan: NutritionalPlan }) => {

    const deletePlanQuery = useDeleteNutritionalPlanQuery(props.plan.id!);
    const navigate = useNavigate();

    const [t, i18n] = useTranslation();
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
        deletePlanQuery.mutate(props.plan.id!);
        navigate((makeLink(WgerLink.NUTRITION_OVERVIEW)));
    };

    const navigateToPdfDownload = () => window.location.href = makeLink(WgerLink.NUTRITION_PLAN_PDF, i18n.language, { id: props.plan.id! });
    const navigateToCopyPlan = () => window.location.href = makeLink(WgerLink.NUTRITION_PLAN_COPY, i18n.language, { id: props.plan.id! });

    const handleOpenEditModal = () => setOpenEditModal(true);
    const handleCloseEditModal = () => setOpenEditModal(false);
    const handleOpenDeleteModal = () => setOpenDeleteModal(true);
    const handleCloseDeleteModal = () => setOpenDeleteModal(false);

    return <>
        <Button onClick={handleClick}>
            <MenuIcon />
        </Button>
        <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
        >
            <MenuItem onClick={handleEdit}>{t("edit")}</MenuItem>
            <MenuItem onClick={navigateToPdfDownload}>{t("downloadAsPdf")}</MenuItem>
            <MenuItem onClick={navigateToCopyPlan}>{t("nutrition.copyPlan")}</MenuItem>
            <MenuItem onClick={handleDelete}>{t("delete")}</MenuItem>
        </Menu>

        <WgerModal title={t('edit')} isOpen={openEditModal} closeFn={handleCloseEditModal}>
            <PlanForm plan={props.plan} closeFn={handleCloseEditModal} />
        </WgerModal>

        <DeleteConfirmationModal
            title={t('deleteConfirmation', { name: props.plan.description })}
            message={t('nutrition.planDeleteInfo')}
            isOpen={openDeleteModal}
            closeFn={handleCloseDeleteModal}
            deleteFn={performDelete}
        />
    </>;
};
