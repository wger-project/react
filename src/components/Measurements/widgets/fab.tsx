import React from "react";
import { Fab } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useTranslation } from "react-i18next";
import { WgerModal } from "@/core/ui/Modals/WgerModal";
import { MeasurementCategory } from "@/components/Measurements/models/Category";
import { CategoryForm } from "@/components/Measurements/widgets/CategoryForm";
import { EntryForm, GroupEntryForm } from "@/components/Measurements/widgets/EntryForm";
import { WeightForm } from "@/components/Measurements/widgets/WeightForm";

export const AddMeasurementCategoryFab = () => {
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
                <CategoryForm closeFn={handleCloseModal} />
            </WgerModal>
        </div>
    );
};

export const AddMeasurementEntryFab = ({ category }: { category: MeasurementCategory }) => {
    const [t] = useTranslation();
    const [openModal, setOpenModal] = React.useState(false);
    const handleOpenModal = () => setOpenModal(true);
    const handleCloseModal = () => setOpenModal(false);


    return (<>
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
            {category.isGroup
                ? <GroupEntryForm closeFn={handleCloseModal} group={category} />
                : <EntryForm closeFn={handleCloseModal} category={category} />}
        </WgerModal>
    </>);
};

export const AddBodyWeightEntryFab = () => {
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
                <WeightForm closeFn={handleCloseModal} />
            </WgerModal>
        </div>
    );
};
