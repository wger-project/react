import AddIcon from "@mui/icons-material/Add";
import { WgerFab } from "@/core/ui/Widgets/Fab";
import { WgerModal } from "@/core/ui/Modals/WgerModal";
import { RoutineForm } from "@/components/Routines/widgets/forms/RoutineForm";
import React from "react";
import { useTranslation } from "react-i18next";

export const AddRoutineFab = () => {

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
                <RoutineForm closeFn={handleCloseModal} />
            </WgerModal>
        </div>
    );
};

export const AddPublicTemplateFab = () => {

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
                <RoutineForm closeFn={handleCloseModal} isTemplate={true} isPublicTemplate={true} />
            </WgerModal>
        </div>
    );
};

export const AddPrivateTemplateFab = () => {

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
                <RoutineForm closeFn={handleCloseModal} isTemplate={true} isPublicTemplate={false} />
            </WgerModal>
        </div>
    );
};