import React from 'react';
import { Fab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { t } from "i18next";
import { WeightForm } from "components/BodyWeight/Form/WeightForm";
import { WgerModal } from "components/Core/WgerModal";


export const WeightEntryFab = () => {

    const [openModal, setOpenModal] = React.useState(false);
    const handleOpenModal = () => setOpenModal(true);
    const handleCloseModal = () => setOpenModal(false);

    return (
        <div>
            <Fab color="primary" aria-label="add" onClick={handleOpenModal}>
                <AddIcon />
            </Fab>
            <WgerModal title={t('add')} isOpen={openModal} closeFn={handleCloseModal}>
                <WeightForm closeFn={handleCloseModal} />
            </WgerModal>
        </div>
    );
};