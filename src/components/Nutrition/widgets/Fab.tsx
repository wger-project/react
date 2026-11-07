import AddIcon from "@mui/icons-material/Add";
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import { WgerFab } from "@/core/ui/Widgets/Fab";
import { WgerModal } from "@/core/ui/Modals/WgerModal";
import { NutritionalPlan } from "@/components/Nutrition/models/nutritionalPlan";
import { NutritionDiaryEntryForm } from "@/components/Nutrition/widgets/forms/NutritionDiaryEntryForm";
import { PlanForm } from "@/components/Nutrition/widgets/forms/PlanForm";
import React from "react";
import { useTranslation } from "react-i18next";

export const AddNutritionalPlanFab = () => {
    const [t] = useTranslation();
    const [openModal, setOpenModal] = React.useState(false);
    const handleOpenModal = () => setOpenModal(true);
    const handleCloseModal = () => setOpenModal(false);


    return (
        <div>
            <WgerFab onClick={handleOpenModal}>
                <AddIcon />
            </WgerFab>
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
            <WgerFab onClick={handleOpenModal}>
                <HistoryEduIcon />
            </WgerFab>
            <WgerModal title={t('nutrition.addNutritionalDiary')} isOpen={openModal} closeFn={handleCloseModal}>
                <NutritionDiaryEntryForm closeFn={handleCloseModal} planId={props.plan.id!} meals={props.plan.meals} />
            </WgerModal>
        </div>
    );
};
