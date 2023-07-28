import React from "react";
import { Fab } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import { useTranslation } from "react-i18next";
import { WgerModal } from "components/Core/Modals/WgerModal";
import { PlanForm } from "components/Nutrition/widgets/forms/PlanForm";
import { NutritionDiaryEntryForm } from "components/Nutrition/widgets/forms/NutritionDiaryEntryForm";
import { NutritionalPlan } from "components/Nutrition/models/nutritionalPlan";

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

export const AddNutritionDiaryEntryFab = (props: { plan: NutritionalPlan }) => {
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
                <HistoryEduIcon />
            </Fab>
            <WgerModal title={t('nutrition.addNutritionalDiary')} isOpen={openModal} closeFn={handleCloseModal}>
                <NutritionDiaryEntryForm closeFn={handleCloseModal} plan={props.plan} />
            </WgerModal>
        </div>
    );
};
