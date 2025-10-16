import React from 'react';
import { Fab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { WeightForm } from "components/BodyWeight/Form/WeightForm";
import { WgerModal } from "components/Core/Modals/WgerModal";
import { useTranslation } from "react-i18next";


export const WeightEntryFab = () => {

    const [t] = useTranslation();
    const [openModal, setOpenModal] = React.useState(false);
    const handleOpenModal = () => setOpenModal(true);
    const handleCloseModal = () => setOpenModal(false);

    return (
        <div>
            <Fab
                color="primary"
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
                <WeightForm closeFn={handleCloseModal} />
            </WgerModal>
        </div>
    );
};