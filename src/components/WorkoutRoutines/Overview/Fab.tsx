import AddIcon from "@mui/icons-material/Add";
import { Fab } from "@mui/material";
import { WgerModal } from "components/Core/Modals/WgerModal";
import { RoutineForm } from "components/WorkoutRoutines/widgets/forms/RoutineForm";
import React from "react";
import { useTranslation } from "react-i18next";

export const AddRoutineFab = () => {

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
                    right: (theme) => `max(${theme.spacing(2)}, calc((100vw - ${theme.breakpoints.values.lg}px) / 2 + ${theme.spacing(2)}))`,
                    zIndex: 9,
                }}>
                <AddIcon />
            </Fab>
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
            <Fab
                color="secondary"
                aria-label="add"
                onClick={handleOpenModal}
                sx={{
                    position: 'fixed',
                    bottom: '5rem',
                    right: (theme) => `max(${theme.spacing(2)}, calc((100vw - ${theme.breakpoints.values.lg}px) / 2 + ${theme.spacing(2)}))`,
                    zIndex: 9,
                }}>
                <AddIcon />
            </Fab>
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
            <Fab
                color="secondary"
                aria-label="add"
                onClick={handleOpenModal}
                sx={{
                    position: 'fixed',
                    bottom: '5rem',
                    right: (theme) => `max(${theme.spacing(2)}, calc((100vw - ${theme.breakpoints.values.lg}px) / 2 + ${theme.spacing(2)}))`,
                    zIndex: 9,
                }}>
                <AddIcon />
            </Fab>
            <WgerModal title={t('add')} isOpen={openModal} closeFn={handleCloseModal}>
                <RoutineForm closeFn={handleCloseModal} isTemplate={true} isPublicTemplate={false} />
            </WgerModal>
        </div>
    );
};