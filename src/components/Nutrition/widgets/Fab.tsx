import React from "react";
import { Fab } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useTranslation } from "react-i18next";
import { WgerModal } from "components/Core/Modals/WgerModal";
import { PlanForm } from "components/Nutrition/widgets/PlanForm";

export const AddNutritionalPlanFab = () => {
    const [t] = useTranslation();
    const [openModal, setOpenModal] = React.useState(false);
    const handleOpenModal = () => setOpenModal(true);
    const handleCloseModal = () => setOpenModal(false);


    return (
        <div>
            <Fab
                color="secondary"
                aria-label="add"
                onClick={handleOpenModal}
                sx={{
                    position: 'fixed',
                    bottom: '5rem',
                    right: (theme) => theme.spacing(2),
                    zIndex: 9,
                }}>
                <AddIcon />
            </Fab>
            <WgerModal title={t('add')} isOpen={openModal} closeFn={handleCloseModal}>
                <PlanForm closeFn={handleCloseModal} />
            </WgerModal>
        </div>
    );
};
