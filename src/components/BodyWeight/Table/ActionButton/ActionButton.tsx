import React from 'react';

import { Button, Menu, MenuItem } from "@mui/material";
import { useTranslation } from "react-i18next";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { WgerModal } from "components/Core/WgerModal/WgerModal";
import { WeightForm } from "components/BodyWeight/Form/WeightForm";
import { WeightEntry } from "components/BodyWeight/model";

interface ActionButtonProps {
    weight: WeightEntry
    handleDeleteWeight: (weight: WeightEntry) => void
}

export const ActionButton = ({ weight, handleDeleteWeight }: ActionButtonProps) => {
    const [t] = useTranslation();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const [openModal, setOpenModal] = React.useState(false);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleEdit = () => {
        handleClose();
        handleOpenModal();
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleDelete = () => {
        handleDeleteWeight(weight);
        setAnchorEl(null);
    };

    const handleOpenModal = () => setOpenModal(true);
    const handleCloseModal = () => setOpenModal(false);


    return (
        <div>
            <Button onClick={handleClick}>
                <ArrowDropDownIcon />
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

            <WgerModal title={t('edit')} isOpen={openModal} closeFn={handleCloseModal}>
                <WeightForm weightEntry={weight} closeFn={handleCloseModal} />
            </WgerModal>
        </div>
    );
};
